import React, { useRef, useState } from 'react'
import { Upload, Trash2, Image, CloudUpload } from 'lucide-react'

/**
 * DSImageUpload - Componente de carga de imágenes
 * 
 * @param {Object} props
 * @param {string} props.label - Label del campo
 * @param {string} props.name - Nombre del campo
 * @param {string} props.value - URL de la imagen actual (para preview)
 * @param {File} props.file - Archivo seleccionado
 * @param {Function} props.onChange - Callback cuando cambia el archivo (file, preview)
 * @param {Function} props.onDelete - Callback cuando se elimina la imagen
 * @param {string} props.accept - Tipos de archivo aceptados
 * @param {number} props.maxSize - Tamaño máximo en bytes
 * @param {string} props.error - Mensaje de error
 * @param {string} props.hint - Texto de ayuda en dropzone
 * @param {boolean} props.disabled - Si está deshabilitado
 * @param {boolean} props.loading - Si está cargando
 * @param {'sm'|'md'|'lg'} props.previewSize - Tamaño del preview
 * @param {'default'|'compact'|'horizontal'|'avatar'} props.variant - Variante visual
 * @param {string} props.className - Clases adicionales
 */
export function DSImageUpload({
    label,
    name,
    value,
    file,
    onChange,
    onDelete,
    accept = 'image/*',
    maxSize,
    error,
    hint = 'PNG, JPG, GIF hasta 2MB',
    disabled = false,
    loading = false,
    previewSize = 'md',
    variant = 'default',
    className = '',
}) {
    const inputRef = useRef(null)
    const [dragOver, setDragOver] = useState(false)
    const [localError, setLocalError] = useState('')
    const [preview, setPreview] = useState(null)

    const displayError = error || localError

    const handleFileSelect = (selectedFile) => {
        if (!selectedFile) return

        // Validar tamaño
        if (maxSize && selectedFile.size > maxSize) {
            setLocalError(`El archivo excede el tamaño máximo de ${formatSize(maxSize)}`)
            return
        }

        setLocalError('')

        // Crear preview
        const reader = new FileReader()
        reader.onload = (e) => {
            setPreview(e.target.result)
            onChange?.(selectedFile, e.target.result)
        }
        reader.readAsDataURL(selectedFile)
    }

    const handleInputChange = (e) => {
        const selectedFile = e.target.files?.[0]
        handleFileSelect(selectedFile)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setDragOver(false)
        if (disabled) return

        const selectedFile = e.dataTransfer.files?.[0]
        handleFileSelect(selectedFile)
    }

    const handleDragOver = (e) => {
        e.preventDefault()
        if (!disabled) setDragOver(true)
    }

    const handleDragLeave = () => {
        setDragOver(false)
    }

    const handleUploadClick = () => {
        inputRef.current?.click()
    }

    const handleDelete = () => {
        setPreview(null)
        setLocalError('')
        if (inputRef.current) inputRef.current.value = ''
        onDelete?.()
    }

    const formatSize = (bytes) => {
        if (bytes < 1024) return `${bytes} B`
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    }

    const displayPreview = preview || value
    const hasPreview = !!displayPreview

    const containerClasses = [
        'ds-image-upload',
        variant !== 'default' && `ds-image-upload--${variant}`,
        displayError && 'ds-image-upload--error',
        loading && 'ds-image-upload--loading',
        className,
    ]
        .filter(Boolean)
        .join(' ')

    const dropzoneClasses = [
        'ds-image-upload__dropzone',
        dragOver && 'ds-image-upload__dropzone--dragging',
        disabled && 'ds-image-upload__dropzone--disabled',
    ]
        .filter(Boolean)
        .join(' ')

    const previewClasses = [
        'ds-image-upload__preview',
        `ds-image-upload__preview--${previewSize}`,
    ]
        .filter(Boolean)
        .join(' ')

    return (
        <div className={containerClasses}>
            {label && (
                <label className="ds-image-upload__label" htmlFor={name}>
                    {label}
                </label>
            )}

            <input
                ref={inputRef}
                type="file"
                id={name}
                name={name}
                accept={accept}
                onChange={handleInputChange}
                disabled={disabled}
                style={{ display: 'none' }}
            />

            {!hasPreview ? (
                <div
                    className={dropzoneClasses}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={handleUploadClick}
                >
                    <span className="ds-image-upload__dropzone-icon">
                        <CloudUpload size={32} />
                    </span>
                    <div className="ds-image-upload__dropzone-text">
                        <strong>Clic para subir</strong> o arrastra y suelta
                    </div>
                    {hint && <div className="ds-image-upload__dropzone-hint">{hint}</div>}
                </div>
            ) : (
                <div className="ds-image-upload__preview-container">
                    <img
                        src={displayPreview}
                        alt="Preview"
                        className={previewClasses}
                    />
                    {file && (
                        <div className="ds-image-upload__file-info">
                            <span className="ds-image-upload__file-name">{file.name}</span>
                            <span className="ds-image-upload__file-size">{formatSize(file.size)}</span>
                        </div>
                    )}
                    <div className="ds-image-upload__actions">
                        <button
                            type="button"
                            className="ds-image-upload__btn-upload"
                            onClick={handleUploadClick}
                            disabled={disabled || loading}
                        >
                            <Upload size={12} />
                            Cambiar
                        </button>
                        <button
                            type="button"
                            className="ds-image-upload__btn-delete"
                            onClick={handleDelete}
                            disabled={disabled || loading}
                        >
                            <Trash2 size={12} />
                        </button>
                    </div>
                    {loading && <div className="ds-image-upload__loading-spinner" />}
                </div>
            )}

            {displayError && (
                <div className="ds-image-upload__error">{displayError}</div>
            )}
        </div>
    )
}

/**
 * DSImagesGrid - Grid de image uploads
 */
export function DSImagesGrid({ children, className = '' }) {
    return <div className={`ds-images-grid ${className}`}>{children}</div>
}
