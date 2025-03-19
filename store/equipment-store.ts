import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types pour les équipements
export interface EquipmentType {
  id: number;
  nom: string;
}

export interface EquipmentModel {
  id: number;
  nom: string;
  type: string;
}

export interface Equipment {
  id: number;
  nom: string;
  modele: string;
  quantite: number;
  statut: string;
}

// Type pour les équipements consolidés
export interface ConsolidatedEquipment {
  modele: string;
  type: string;
  quantite: number;
}

// Type pour le store
interface EquipmentState {
  // États sélectionnés
  selectedType: EquipmentType | null;
  selectedModel: EquipmentModel | null;

  // Données chargées depuis l'API
  equipmentTypes: EquipmentType[];
  equipmentModels: EquipmentModel[];
  equipments: Equipment[];

  // Données consolidées
  consolidatedEquipments: ConsolidatedEquipment[];
  isConsolidationModified: boolean;

  // Gestion de la pagination
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;

  // Gestion des erreurs et chargement
  isLoading: boolean;
  error: string | null;

  // Actions
  setSelectedType: (type: EquipmentType | null) => void;
  setSelectedModel: (model: EquipmentModel | null) => void;
  setEquipmentTypes: (types: EquipmentType[]) => void;
  setEquipmentModels: (models: EquipmentModel[]) => void;
  setEquipments: (equipments: Equipment[]) => void;
  setCurrentPage: (page: number) => void;
  setTotalPages: (pages: number) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  resetSelection: () => void;

  // Actions pour la consolidation
  setConsolidatedEquipments: (equipments: ConsolidatedEquipment[]) => void;
  updateConsolidatedEquipment: (index: number, updatedEquipment: ConsolidatedEquipment) => void;
  consolidateEquipments: () => void;
  setIsConsolidationModified: (isModified: boolean) => void;
}

// Création du store avec persistance
export const useEquipmentStore = create<EquipmentState>()(
  persist(
    (set, get) => ({
      // États initiaux
      selectedType: null,
      selectedModel: null,
      equipmentTypes: [],
      equipmentModels: [],
      equipments: [],
      consolidatedEquipments: [],
      isConsolidationModified: false,
      currentPage: 1,
      totalPages: 1,
      itemsPerPage: 10,
      isLoading: false,
      error: null,

      // Actions
      setSelectedType: (type) => set({ selectedType: type, selectedModel: null }),
      setSelectedModel: (model) => set({ selectedModel: model }),
      setEquipmentTypes: (types) => set({ equipmentTypes: types }),
      setEquipmentModels: (models) => set({ equipmentModels: models }),
      setEquipments: (equipments) => set({ equipments }),
      setCurrentPage: (page) => set({ currentPage: page }),
      setTotalPages: (pages) => set({ totalPages: pages }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      resetSelection: () => set({ selectedType: null, selectedModel: null }),

      // Actions pour la consolidation
      setConsolidatedEquipments: (consolidatedEquipments) => set({
        consolidatedEquipments,
        isConsolidationModified: false
      }),
      updateConsolidatedEquipment: (index, updatedEquipment) => {
        const updatedEquipments = [...get().consolidatedEquipments];
        updatedEquipments[index] = updatedEquipment;
        set({
          consolidatedEquipments: updatedEquipments,
          isConsolidationModified: true
        });
      },
      consolidateEquipments: () => {
        const { equipments } = get();

        // Créer un Map pour regrouper les équipements par modèle
        const equipmentMap = new Map<string, ConsolidatedEquipment>();

        equipments.forEach(equipment => {
          const key = equipment.modele;

          if (equipmentMap.has(key)) {
            // Si le modèle existe déjà, additionner la quantité
            const existingEquipment = equipmentMap.get(key)!;
            existingEquipment.quantite += equipment.quantite;
          } else {
            // Sinon, créer une nouvelle entrée
            equipmentMap.set(key, {
              modele: equipment.modele,
              type: equipment.modele.includes('Écran') ? 'Écran' :
                   equipment.modele.includes('Portable') || equipment.modele.includes('MacBook') ? 'Ordinateur Portable' :
                   equipment.modele.includes('Serveur') || equipment.modele.includes('PowerEdge') ? 'Serveur' : 'Autre',
              quantite: equipment.quantite
            });
          }
        });

        // Convertir le Map en tableau
        const consolidatedEquipments = Array.from(equipmentMap.values());

        set({
          consolidatedEquipments,
          isConsolidationModified: false
        });
      },
      setIsConsolidationModified: (isModified) => set({ isConsolidationModified: isModified }),
    }),
    {
      name: 'equipment-storage',
    }
  )
);
