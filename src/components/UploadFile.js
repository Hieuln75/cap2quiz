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
        {/* Input file ẩn */}
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
import React, { useState } from 'react'
import nhost from '../services/nhost'  // client Nhost đã khởi tạo sẵn

const subdomain = 'oojbgyspwbwvnpxnokol'  // đổi thành subdomain của bạn
const region = 'ap-southeast-1'           // đổi thành region của bạn


export default function UploadFile() {
  const [fileUrls, setFileUrls] = useState([])
  const [error, setError] = useState(null)
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    setUploading(true)
    setError(null)

    const uploadedUrls = []

    for (const file of files) {
      // Upload file lên Nhost Storage
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

      // Tạo URL truy cập file theo file id
      const url = `https://${subdomain}.storage.${region}.nhost.run/v1/files/${fileMetadata.id}`

      // Insert mapping file_id + file_name + url vào bảng files_mapping qua GraphQL
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
  }

  return (
    <div>
      <h2>Upload nhiều file lên Nhost và lưu mapping vào DB</h2>
      <input type="file" onChange={handleUpload} multiple />
      {uploading && <p>⏳ Đang upload...</p>}
      {error && <p style={{ color: 'red' }}>❌ {error}</p>}
      {fileUrls.length > 0 && (
        <div>
          <h3>✅ File đã upload:</h3>
          <ul>
            {fileUrls.map(file => (
              <li key={file.url}>
                <a href={file.url} target="_blank" rel="noopener noreferrer">{file.name}</a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}


{/*
export default function UploadFile() {
  const [fileUrls, setFileUrls] = useState([])
  const [error, setError] = useState(null)
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    setUploading(true)
    setError(null)

    const uploadedUrls = []

    for (const file of files) {
      // Upload file lên Nhost Storage
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

      // Insert mapping file_id + file_name vào bảng files_mapping qua GraphQL
      try {
        const insertMutation = `
          mutation InsertFileMapping($file_id: uuid!, $file_name: String!) {
            insert_files_mapping_one(object: { file_id: $file_id, file_name: $file_name }) {
              id
            }
          }
        `
        const variables = {
          file_id: fileMetadata.id,
          file_name: fileMetadata.name
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

      // Tạo URL truy cập file theo file id
      const url = `https://${subdomain}.storage.${region}.nhost.run/v1/files/${fileMetadata.id}`
      uploadedUrls.push({ name: fileMetadata.name, url })
    }

    setFileUrls(uploadedUrls)
    setUploading(false)
  }

  return (
    <div>
      <h2>Upload nhiều file lên Nhost và lưu mapping vào DB</h2>
      <input type="file" onChange={handleUpload} multiple />
      {uploading && <p>⏳ Đang upload...</p>}
      {error && <p style={{ color: 'red' }}>❌ {error}</p>}
      {fileUrls.length > 0 && (
        <div>
          <h3>✅ File đã upload:</h3>
          <ul>
            {fileUrls.map(file => (
              <li key={file.url}>
                <a href={file.url} target="_blank" rel="noopener noreferrer">{file.name}</a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}*/}
