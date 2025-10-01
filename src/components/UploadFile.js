import React, { useState, useRef } from 'react'
import nhost from '../services/nhost'

const subdomain = 'oojbgyspwbwvnpxnokol'
const region = 'ap-southeast-1'

// Cloudinary config
const cloudName = 'duwsnzzqf'
const uploadPreset = 'englishupload'

export default function UploadFile() {
  const [fileUrls, setFileUrls] = useState([])
  const [error, setError] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [permission, setPermission] = useState('')
  const [useCloudinary, setUseCloudinary] = useState(false)

  const fileInputRef = useRef(null)

  // Upload lên Cloudinary
  const uploadToCloudinary = async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', uploadPreset)
    formData.append('folder', 'ieltread')

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
      method: 'POST',
      body: formData
    })

    if (!res.ok) {
      throw new Error(`Cloudinary upload failed: ${res.statusText}`)
    }

    const data = await res.json()
    return data.secure_url
  }

  // Upload lên Nhost
  const uploadToNhost = async (file) => {
    const { fileMetadata, error: uploadError } = await nhost.storage.upload({
      file,
      name: file.name,
      visibility: 'public'
    })

    if (uploadError) {
      throw new Error(`Nhost upload error: ${uploadError.message}`)
    }

    if (!fileMetadata) {
      throw new Error('Nhost upload thành công nhưng không nhận được metadata file')
    }

    const url = `https://${subdomain}.storage.${region}.nhost.run/v1/files/${fileMetadata.id}`
    return { id: fileMetadata.id, name: fileMetadata.name, url }
  }

  const handleUpload = async (e) => {
    setError(null)
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    if (permission !== '6688') {
      const msg = 'Bạn phải nhập đúng quyền đã cấp mới được upload'
      alert(msg)
      setError(msg)
      return
    }

    setUploading(true)
    const uploadedUrls = []

    for (const file of files) {
      try {
        if (useCloudinary) {
          // ✅ Upload Cloudinary
          const url = await uploadToCloudinary(file)

          const insertMutation = `
            mutation InsertFileMapping($file_name: String!, $url: String!) {
              insert_files_mapping_one(object: { file_name: $file_name, url: $url }) {
                id
              }
            }
          `
          const variables = { file_name: file.name, url }

          const response = await nhost.graphql.request(insertMutation, variables)
          console.log('Cloudinary mapping response:', response)

          if (response.error) {
            const errorMsg = `Lỗi khi lưu mapping ${file.name}: ${response.error.message || 'Không xác định'}`
            alert(errorMsg)
            setError(errorMsg)
            continue
          }

          if (response.errors && response.errors.length > 0) {
            const errorMsg = `Lỗi khi lưu mapping ${file.name}: ${response.errors[0].message}`
            alert(errorMsg)
            setError(errorMsg)
            continue
          }

          if (!response.data || !response.data.insert_files_mapping_one) {
            const errorMsg = `Lỗi không rõ khi insert mapping ${file.name}`
            alert(errorMsg)
            setError(errorMsg)
            continue
          }

          uploadedUrls.push({ name: file.name, url })

        } else {
          // ✅ Upload Nhost
          const { id, name, url } = await uploadToNhost(file)

          const insertMutation = `
            mutation InsertFileMapping($file_id: uuid!, $file_name: String!, $url: String!) {
              insert_files_mapping_one(object: { file_id: $file_id, file_name: $file_name, url: $url }) {
                id
              }
            }
          `
          const variables = { file_id: id, file_name: name, url }

          const response = await nhost.graphql.request(insertMutation, variables)
          console.log('Nhost mapping response:', response)

          if (response.error) {
            const errorMsg = `Lỗi khi lưu mapping ${name}: ${response.error.message || 'Không xác định'}`
            alert(errorMsg)
            setError(errorMsg)
            continue
          }

          if (response.errors && response.errors.length > 0) {
            const errorMsg = `Lỗi khi lưu mapping ${name}: ${response.errors[0].message}`
            alert(errorMsg)
            setError(errorMsg)
            continue
          }

          if (!response.data || !response.data.insert_files_mapping_one) {
            const errorMsg = `Lỗi không rõ khi insert mapping ${name}`
            alert(errorMsg)
            setError(errorMsg)
            continue
          }

          uploadedUrls.push({ name, url })
        }

      } catch (err) {
        const errorMsg = `Lỗi khi upload hoặc lưu mapping ${file.name}: ${err.message}`
        alert(errorMsg)
        setError(errorMsg)
        continue
      }
    }

    setFileUrls(uploadedUrls)
    setUploading(false)
    e.target.value = ''
  }

  const handleChooseFilesClick = () => {
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div>
      <h2>Upload nhiều file lên Nhost hoặc Cloudinary và lưu mapping vào DB</h2>

      <div style={{ marginBottom: '8px' }}>
        <label htmlFor="permissionInput" style={{ fontWeight: 'bold' }}>
          Nhập quyền để upload files:
        </label>
        <br />
        <input
          id="permissionInput"
          type="text"
          placeholder="Nhập quyền"
          value={permission}
          onChange={e => setPermission(e.target.value)}
          style={{ width: '200px', padding: '4px', marginTop: '4px' }}
          disabled={uploading}
        />
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label style={{ marginRight: 12 }}>
          <input
            type="checkbox"
            checked={useCloudinary}
            onChange={e => setUseCloudinary(e.target.checked)}
            disabled={uploading}
          /> Upload lên Cloudinary (bỏ chọn để upload lên Nhost)
        </label>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <button
          onClick={handleChooseFilesClick}
          disabled={uploading}
          style={{
            padding: '8px 16px',
            cursor: uploading ? 'not-allowed' : 'pointer',
          }}
        >
          Chọn file để upload
        </button>

        <input
          type="file"
          multiple
          onChange={handleUpload}
          ref={fileInputRef}
          style={{ display: 'none' }}
          disabled={uploading}
        />
      </div>

      {uploading && <p>⏳ Đang upload...</p>}
      {error && <p style={{ color: 'red' }}>❌ {error}</p>}

      {fileUrls.length > 0 && (
        <div>
          <h3>✅ File đã upload:</h3>
          <ul>
            {fileUrls.map(file => (
              <li key={file.url}>
                <a href={file.url} target="_blank" rel="noopener noreferrer">
                  {file.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}


{/*import React, { useState, useRef } from 'react'
import nhost from '../services/nhost'

const subdomain = 'oojbgyspwbwvnpxnokol'
const region = 'ap-southeast-1'

const cloudName = 'duwsnzzqf'  // Thay bằng của bạn
const uploadPreset = 'englishupload' // Thay bằng của bạn

export default function UploadFile() {
  const [fileUrls, setFileUrls] = useState([])
  const [error, setError] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [permission, setPermission] = useState('')
  const [useCloudinary, setUseCloudinary] = useState(false)

  const fileInputRef = useRef(null)

  // Upload file lên Cloudinary
  const uploadToCloudinary = async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', uploadPreset)
    formData.append('folder', 'newdata')
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
      method: 'POST',
      body: formData
    })

    if (!res.ok) {
      throw new Error(`Cloudinary upload failed: ${res.statusText}`)
    }

    const data = await res.json()
    return data.secure_url
  }

  // Upload file lên Nhost
  const uploadToNhost = async (file) => {
    const { fileMetadata, error: uploadError } = await nhost.storage.upload({
      file,
      name: file.name,
      visibility: 'public'
    })

    if (uploadError) {
      throw new Error(`Nhost upload error: ${uploadError.message}`)
    }

    if (!fileMetadata) {
      throw new Error('Nhost upload thành công nhưng không nhận được metadata file')
    }

    const url = `https://${subdomain}.storage.${region}.nhost.run/v1/files/${fileMetadata.id}`

    return { id: fileMetadata.id, name: fileMetadata.name, url }
  }

  const handleUpload = async (e) => {
    setError(null)
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    if (permission !== '6688') {
      setError('Bạn phải nhập đúng quyền đã cấp mới được upload')
      return
    }

    setUploading(true)
    const uploadedUrls = []

    for (const file of files) {
      try {
        if (useCloudinary) {
          // Upload Cloudinary
          const url = await uploadToCloudinary(file)

          // Insert mapping không có file_id
          const insertMutation = `
            mutation InsertFileMapping($file_name: String!, $url: String!) {
              insert_files_mapping_one(object: { file_name: $file_name, url: $url }) {
                id
              }
            }
          `
          const variables = {
            file_name: file.name,
            url
          }

          const { error: dbError } = await nhost.graphql.request(insertMutation, variables)
         

          if (dbError) {
  const errorMsg = `Lỗi khi lưu mapping ${file.name}: ${dbError.message || 'Không xác định'}`
  alert(errorMsg)
  setError(errorMsg)
  continue
}


          uploadedUrls.push({ name: file.name, url })

        } else {
          // Upload Nhost
          const { id, name, url } = await uploadToNhost(file)

          // Insert mapping có file_id
          const insertMutation = `
            mutation InsertFileMapping($file_id: uuid!, $file_name: String!, $url: String!) {
              insert_files_mapping_one(object: { file_id: $file_id, file_name: $file_name, url: $url }) {
                id
              }
            }
          `
          const variables = {
            file_id: id,
            file_name: name,
            url
          }

          const { error: dbError } = await nhost.graphql.request(insertMutation, variables)
          if (dbError) {
            setError(`Lỗi khi lưu mapping ${file.name}: ${dbError.message}`)
            continue
          }

          uploadedUrls.push({ name, url })
        }
      } catch (err) {
        setError(`Lỗi khi upload hoặc lưu mapping ${file.name}: ${err.message}`)
        continue
      }
    }

    setFileUrls(uploadedUrls)
    setUploading(false)
    e.target.value = '' // reset input file
  }

  const handleChooseFilesClick = () => {
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div>
      <h2>Upload nhiều file lên Nhost hoặc Cloudinary và lưu mapping vào DB</h2>

      <div style={{ marginBottom: '8px' }}>
        <label htmlFor="permissionInput" style={{ fontWeight: 'bold' }}>
          Nhập quyền để upload files:
        </label>
        <br />
        <input
          id="permissionInput"
          type="text"
          placeholder="Nhập quyền"
          value={permission}
          onChange={e => setPermission(e.target.value)}
          style={{ width: '200px', padding: '4px', marginTop: '4px' }}
          disabled={uploading}
        />
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label style={{ marginRight: 12 }}>
          <input
            type="checkbox"
            checked={useCloudinary}
            onChange={e => setUseCloudinary(e.target.checked)}
            disabled={uploading}
          /> Upload lên Cloudinary (bỏ chọn để upload lên Nhost)
        </label>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <button
          onClick={handleChooseFilesClick}
          disabled={uploading}
          style={{
            padding: '8px 16px',
            cursor: uploading ? 'not-allowed' : 'pointer',
          }}
        >
          Chọn file để upload
        </button>

        <input
          type="file"
          multiple
          onChange={handleUpload}
          ref={fileInputRef}
          style={{ display: 'none' }}
          disabled={uploading}
        />
      </div>

      {uploading && <p>⏳ Đang upload...</p>}
      {error && <p style={{ color: 'red' }}>❌ {error}</p>}

      {fileUrls.length > 0 && (
        <div>
          <h3>✅ File đã upload:</h3>
          <ul>
            {fileUrls.map(file => (
              <li key={file.url}>
                <a href={file.url} target="_blank" rel="noopener noreferrer">
                  {file.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}


{/*
  import React, { useState, useRef } from 'react'
import nhost from '../services/nhost'

const subdomain = 'oojbgyspwbwvnpxnokol'
const region = 'ap-southeast-1'

export default function UploadFile() {
  const [fileUrls, setFileUrls] = useState([])
  const [error, setError] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [permission, setPermission] = useState('')

  // ref để trigger click input file ẩn
  const fileInputRef = useRef(null)

  const handleUpload = async (e) => {
    setError(null)
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    setUploading(true)
    const uploadedUrls = []

    for (const file of files) {
      const { fileMetadata, error: uploadError } = await nhost.storage.upload({
        file,
        name: file.name,
        visibility: 'public'
      })

      if (uploadError) {
        setError(`Lỗi khi upload ${file.name}: ${uploadError.message}`)
        continue
      }

      if (!fileMetadata) {
        setError(`Upload thành công nhưng không nhận được thông tin file cho ${file.name}`)
        continue
      }

      const url = `https://${subdomain}.storage.${region}.nhost.run/v1/files/${fileMetadata.id}`

      try {
        const insertMutation = `
          mutation InsertFileMapping($file_id: uuid!, $file_name: String!, $url: String!) {
            insert_files_mapping_one(object: { file_id: $file_id, file_name: $file_name, url: $url }) {
              id
            }
          }
        `
        const variables = {
          file_id: fileMetadata.id,
          file_name: fileMetadata.name,
          url
        }

        const { error: dbError } = await nhost.graphql.request(insertMutation, variables)
        if (dbError) {
          setError(`Lỗi khi lưu mapping ${file.name}: ${dbError.message}`)
          continue
        }

      } catch (err) {
        setError(`Lỗi không xác định khi lưu mapping ${file.name}: ${err.message}`)
        continue
      }

      uploadedUrls.push({ name: fileMetadata.name, url })
    }

    setFileUrls(uploadedUrls)
    setUploading(false)
    // Reset input file để lần sau chọn lại vẫn kích hoạt onChange
    e.target.value = ''
  }

  // Hàm xử lý khi bấm nút chọn file
  const handleChooseFilesClick = () => {
    setError(null)
    if (permission !== '6688') {
      setError('Bạn phải nhập đúng  quyền đã cấp mới được upload')
      return
    }
    if (fileInputRef.current) {
      fileInputRef.current.click() // mở dialog chọn file
    }
  }

  return (
    <div>
      <h2>Upload nhiều file lên Nhost và lưu mapping vào DB</h2>

      <div style={{ marginBottom: '8px' }}>
        <label htmlFor="permissionInput" style={{ fontWeight: 'bold' }}>
          Nhập quyền để upload files:
        </label>
        <br />
        <input
          id="permissionInput"
          type="text"
          placeholder="Nhập quyền"
          value={permission}
          onChange={e => setPermission(e.target.value)}
          style={{ width: '200px', padding: '4px', marginTop: '4px' }}
          disabled={uploading}
        />
      </div>

      <div style={{ marginBottom: '12px' }}>
        <button
          onClick={handleChooseFilesClick}
          disabled={uploading}
          style={{
            padding: '8px 16px',
            cursor: uploading ? 'not-allowed' : 'pointer',
          }}
        >
          Chọn file để upload
        </button>

        <input
          type="file"
          multiple
          onChange={handleUpload}
          ref={fileInputRef}
          style={{ display: 'none' }}
          disabled={uploading}
        />
      </div>

      {uploading && <p>⏳ Đang upload...</p>}
      {error && <p style={{ color: 'red' }}>❌ {error}</p>}

      {fileUrls.length > 0 && (
        <div>
          <h3>✅ File đã upload:</h3>
          <ul>
            {fileUrls.map(file => (
              <li key={file.url}>
                <a href={file.url} target="_blank" rel="noopener noreferrer">
                  {file.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
*/}
