import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';

/**
 * DSSearchSelect - Select con buscador integrado
 * 
 * Props:
 * - options: Array de { value, label }
 * - value: Valor seleccionado
 * - onChange: Callback cuando cambia la selección
 * - placeholder: Texto placeholder
 * - searchPlaceholder: Texto del buscador
 * - disabled: Deshabilitar
 * - clearable: Permitir limpiar selección
 */
export function DSSearchSelect({
    options = [],
    value,
    onChange,
    placeholder = 'Seleccionar...',
    searchPlaceholder = 'Buscar...',
    disabled = false,
    clearable = false,
    className = '',
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef(null);
    const searchInputRef = useRef(null);

    // Filtrar opciones por búsqueda
    const filteredOptions = useMemo(() => {
        if (!search.trim()) return options;
        const query = search.toLowerCase();
        return options.filter(opt =>
            opt.label.toLowerCase().includes(query)
        );
    }, [options, search]);

    // Obtener label del valor actual
    const selectedLabel = useMemo(() => {
        const selected = options.find(opt => opt.value === value);
        return selected ? selected.label : '';
    }, [options, value]);

    // Cerrar al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearch('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focus en el input de búsqueda al abrir
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isOpen]);

    const handleSelect = (opt) => {
        onChange?.(opt.value);
        setIsOpen(false);
        setSearch('');
    };

    const handleClear = (e) => {
        e.stopPropagation();
        onChange?.('');
    };

    const toggleOpen = () => {
        if (!disabled) {
            setIsOpen(!isOpen);
            if (!isOpen) setSearch('');
        }
    };

    return (
        <div
            ref={containerRef}
            className={`ds-search-select ${isOpen ? 'is-open' : ''} ${disabled ? 'is-disabled' : ''} ${className}`}
        >
            {/* Trigger */}
            <div className="ds-search-select__trigger" onClick={toggleOpen}>
                <span className={`ds-search-select__value ${!selectedLabel ? 'is-placeholder' : ''}`}>
                    {selectedLabel || placeholder}
                </span>
                <div className="ds-search-select__icons">
                    {clearable && value && (
                        <button
                            type="button"
                            className="ds-search-select__clear"
                            onClick={handleClear}
                            tabIndex={-1}
                        >
                            <X size={14} />
                        </button>
                    )}
                    <ChevronDown size={16} className={`ds-search-select__chevron ${isOpen ? 'is-rotated' : ''}`} />
                </div>
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div className="ds-search-select__dropdown">
                    {/* Search input */}
                    <div className="ds-search-select__search">
                        <Search size={14} className="ds-search-select__search-icon" />
                        <input
                            ref={searchInputRef}
                            type="text"
                            className="ds-search-select__search-input"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={searchPlaceholder}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>

                    {/* Options list */}
                    <div className="ds-search-select__options">
                        {filteredOptions.length === 0 ? (
                            <div className="ds-search-select__empty">
                                Sin resultados
                            </div>
                        ) : (
                            filteredOptions.map((opt) => (
                                <div
                                    key={opt.value}
                                    className={`ds-search-select__option ${opt.value === value ? 'is-selected' : ''}`}
                                    onClick={() => handleSelect(opt)}
                                >
                                    {opt.label}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default DSSearchSelect;
