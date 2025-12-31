import React, { useRef, useState, useCallback } from 'react';
import { Camera, Upload, X, RotateCcw } from 'lucide-react';
import { DSButton } from '../ds-components';
import './PhotoCapture.css';

/**
 * Componente para capturar o subir foto con compresión automática.
 * Soporta cámara (móvil) y subir archivo (desktop).
 * 
 * @param {function} onCapture - Callback con el Blob de la imagen capturada
 * @param {string} value - URL de preview actual (opcional)
 * @param {boolean} disabled - Deshabilitar captura
 * @param {string} label - Label para el campo
 */
export function PhotoCapture({ onCapture, value, disabled = false, label = 'Foto de Recepción' }) {
    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);
    const [preview, setPreview] = useState(value || null);
    const [loading, setLoading] = useState(false);

    // Detectar si es dispositivo móvil (tiene cámara accesible)
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        || ('ontouchstart' in window)
        || (navigator.maxTouchPoints > 0);

    /**
     * Comprimir imagen usando Canvas
     * - Reduce a máximo 1200px de ancho
     * - Calidad JPEG 80%
     */
    const compressImage = useCallback((file, maxWidth = 1200, quality = 0.8) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Redimensionar si es muy grande
                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob(
                        (blob) => {
                            if (blob) {
                                resolve(blob);
                            } else {
                                reject(new Error('Error al comprimir imagen'));
                            }
                        },
                        'image/jpeg',
                        quality
                    );
                };
                img.onerror = () => reject(new Error('Error al cargar imagen'));
                img.src = e.target.result;
            };
            reader.onerror = () => reject(new Error('Error al leer archivo'));
            reader.readAsDataURL(file);
        });
    }, []);

    /**
     * Procesar imagen seleccionada/capturada
     */
    const handleImageSelect = useCallback(async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
            alert('Por favor seleccione una imagen válida');
            return;
        }

        // Validar tamaño (máximo 10MB antes de comprimir)
        if (file.size > 10 * 1024 * 1024) {
            alert('La imagen es demasiado grande (máximo 10MB)');
            return;
        }

        setLoading(true);
        try {
            const compressedBlob = await compressImage(file);
            const previewUrl = URL.createObjectURL(compressedBlob);
            setPreview(previewUrl);
            onCapture?.(compressedBlob);
        } catch (error) {
            console.error('Error procesando imagen:', error);
            alert('Error al procesar la imagen');
        } finally {
            setLoading(false);
        }
    }, [compressImage, onCapture]);

    /**
     * Limpiar imagen seleccionada
     */
    const handleClear = useCallback(() => {
        if (preview && preview.startsWith('blob:')) {
            URL.revokeObjectURL(preview);
        }
        setPreview(null);
        onCapture?.(null);
        // Resetear inputs
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (cameraInputRef.current) cameraInputRef.current.value = '';
    }, [preview, onCapture]);

    return (
        <div className="photo-capture">
            <label className="ds-field__label">{label}</label>

            {/* Preview de la imagen */}
            {preview ? (
                <div className="photo-capture__preview">
                    <img src={preview} alt="Preview" />
                    <div className="photo-capture__preview-actions">
                        <DSButton
                            size="sm"
                            variant="secondary"
                            icon={<RotateCcw size={16} />}
                            onClick={handleClear}
                            disabled={disabled}
                        >
                            Cambiar
                        </DSButton>
                        <DSButton
                            size="sm"
                            variant="danger"
                            icon={<X size={16} />}
                            onClick={handleClear}
                            disabled={disabled}
                        >
                            Quitar
                        </DSButton>
                    </div>
                </div>
            ) : (
                <div className="photo-capture__buttons">
                    {/* Botón Cámara (solo en móvil) */}
                    {isMobile && (
                        <DSButton
                            variant="secondary"
                            icon={<Camera size={18} />}
                            onClick={() => cameraInputRef.current?.click()}
                            disabled={disabled || loading}
                            loading={loading}
                        >
                            Tomar Foto
                        </DSButton>
                    )}

                    {/* Botón Subir */}
                    <DSButton
                        variant="secondary"
                        icon={<Upload size={18} />}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={disabled || loading}
                        loading={loading}
                    >
                        {isMobile ? 'Subir Archivo' : 'Seleccionar Imagen'}
                    </DSButton>
                </div>
            )}

            {/* Input oculto para cámara */}
            <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageSelect}
                style={{ display: 'none' }}
            />

            {/* Input oculto para archivo */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                onChange={handleImageSelect}
                style={{ display: 'none' }}
            />
        </div>
    );
}

export default PhotoCapture;
