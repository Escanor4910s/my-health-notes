import { useState, useEffect } from 'react';
import { SYMPTOM_TYPES, SYMPTOM_FIELDS } from './symptomsConfig';

export function useSymptomCatalog() {
  const [types, setTypes] = useState(SYMPTOM_TYPES);
  const [fields, setFields] = useState(SYMPTOM_FIELDS);

  // Load from localStorage on mount
  useEffect(() => {
    const customTypes = localStorage.getItem('obsmed_custom_symptom_types');
    const customFields = localStorage.getItem('obsmed_custom_symptom_fields');

    if (customTypes) {
      try {
        setTypes(JSON.parse(customTypes));
      } catch (e) {
        console.error("Error loading custom symptom types", e);
      }
    }

    if (customFields) {
      try {
        setFields(JSON.parse(customFields));
      } catch (e) {
        console.error("Error loading custom symptom fields", e);
      }
    }
  }, []);

  const addCustomType = (newType) => {
    if (types.includes(newType)) return;
    
    // Add to types, right before "Autre"
    const newTypes = [...types.filter(t => t !== 'Autre'), newType, 'Autre'];
    
    // Initialize with a default description field if not present
    const newFields = {
      ...fields,
      [newType]: [{ id: 'description_libre', label: 'Description détaillée', type: 'textarea' }]
    };

    setTypes(newTypes);
    setFields(newFields);
    
    localStorage.setItem('obsmed_custom_symptom_types', JSON.stringify(newTypes));
    localStorage.setItem('obsmed_custom_symptom_fields', JSON.stringify(newFields));
  };

  const updateTypeFields = (type, newFieldsArray) => {
    const newFields = {
      ...fields,
      [type]: newFieldsArray
    };
    
    setFields(newFields);
    localStorage.setItem('obsmed_custom_symptom_fields', JSON.stringify(newFields));
  };

  const getFields = (type) => {
    return fields[type] || fields['Autre'];
  };

  const deleteCustomType = (typeToDelete) => {
    // Prevent deleting base types
    const baseTypes = ['Douleur', 'Vomissements', 'Fièvre', 'Masse', 'Céphalées', 'Toux', 'Diarrhée', 'Autre'];
    if (baseTypes.includes(typeToDelete)) return false;

    const newTypes = types.filter(t => t !== typeToDelete);
    const newFields = { ...fields };
    delete newFields[typeToDelete];

    setTypes(newTypes);
    setFields(newFields);
    
    localStorage.setItem('obsmed_custom_symptom_types', JSON.stringify(newTypes));
    localStorage.setItem('obsmed_custom_symptom_fields', JSON.stringify(newFields));
    return true;
  };

  return {
    types,
    fields,
    getFields,
    addCustomType,
    updateTypeFields,
    deleteCustomType
  };
}
