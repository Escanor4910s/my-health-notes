import { useState, useEffect } from 'react';

export function useDynamicCatalog(storageKey, defaultCatalog) {
  const [catalog, setCatalog] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Conserve only custom signs from localStorage
        const customSigns = parsed.filter(item => item.isCustom);
        return [...defaultCatalog, ...customSigns];
      }
    } catch (e) {
      console.error(`Error loading catalog for ${storageKey}:`, e);
    }
    return defaultCatalog;
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(catalog));
  }, [catalog, storageKey]);

  const addCustomSign = (label, category) => {
    if (!label.trim()) return null;
    const newSign = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      label: label.trim(),
      category,
      isCustom: true
    };
    setCatalog(prev => [...prev, newSign]);
    return newSign;
  };

  const updateCustomSign = (id, newLabel) => {
    setCatalog(prev => prev.map(item => 
      item.id === id ? { ...item, label: newLabel } : item
    ));
  };

  const deleteCustomSign = (id) => {
    setCatalog(prev => prev.filter(item => item.id !== id));
  };

  const getCatalogByCategory = (category) => {
    return catalog.filter(item => item.category === category);
  };

  return { 
    catalog, 
    getCatalogByCategory, 
    addCustomSign, 
    updateCustomSign, 
    deleteCustomSign 
  };
}
