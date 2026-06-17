<template>
    <div class="modal-overlay">
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="modal-title">Asignar Cliente</h2>
                <button @click="$emit('close')" class="btn-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>

            <div class="modal-body">
                <div class="search-box">
                    <input v-model="searchQuery" @input="debouncedSearch" placeholder="Buscar por nombre, DNI..."
                        class="form-control" ref="searchInput" />
                    <i class="fas fa-search search-icon"></i>
                </div>

                <div v-if="salesStore.loading" class="loading-state">
                    <i class="fas fa-spinner fa-spin"></i> Buscando...
                </div>

                <div class="results-list" v-else>
                    <div v-for="client in results" :key="client._id" class="client-item" @click="selectClient(client)">
                        <div class="client-avatar">
                            <i class="fas fa-user"></i>
                        </div>
                        <div class="client-info">
                            <div class="client-name">{{ client.name }}</div>
                            <div class="client-detail">{{ client.address || 'Sin dirección' }}</div>
                        </div>
                        <i class="fas fa-chevron-right arrow-icon"></i>
                    </div>

                    <div v-if="results.length === 0 && searchQuery.length > 2" class="no-results">
                        No se encontraron clientes
                    </div>
                    <div v-if="searchQuery.length <= 2" class="placeholder-text">
                        Escriba para buscar...
                    </div>
                </div>
            </div>

            <div class="modal-footer">
                <button v-if="salesStore.selectedClient" @click="clearClient" class="btn-clear">
                    <i class="fas fa-user-times"></i> Desvincular Cliente
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import { useSalesStore } from "@/stores/salesStore";
import { ref, watch, onMounted } from 'vue';

export default {
    emits: ['close'],
    setup(props, { emit }) {
        const salesStore = useSalesStore();
        const searchQuery = ref("");
        const results = ref([]);
        let timeout = null;

        const searchInput = ref(null);

        onMounted(() => {
            setTimeout(() => {
                searchInput.value?.focus();
            }, 100);
        });

        const debouncedSearch = () => {
            clearTimeout(timeout);
            timeout = setTimeout(async () => {
                if (searchQuery.value.length > 2) {
                    await salesStore.searchClients(searchQuery.value);
                    results.value = salesStore.clientSearchResults;
                } else {
                    results.value = [];
                }
            }, 500);
        };

        const selectClient = (client) => {
            salesStore.selectClient(client);
            emit('close');
        };

        const clearClient = () => {
            salesStore.clearSelectedClient();
            emit('close');
        }

        return {
            salesStore,
            searchQuery,
            results,
            debouncedSearch,
            selectClient,
            clearClient,
            searchInput
        };
    }
};
</script>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 3000;
    /* High z-index */
    padding: 1rem;
}

.modal-content {
    background-color: white;
    border-radius: 1rem;
    width: 100%;
    max-width: 500px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.25rem;
    border-bottom: 1px solid #f3f4f6;
}

.modal-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: #111827;
    margin: 0;
}

.btn-close {
    background: none;
    border: none;
    color: #6b7280;
    font-size: 1.25rem;
    cursor: pointer;
}

.modal-body {
    padding: 1.25rem;
    overflow-y: auto;
    flex: 1;
}

.search-box {
    position: relative;
    margin-bottom: 1.5rem;
}

.search-box input {
    width: 100%;
    padding: 1rem 1rem 1rem 3rem;
    border: 2px solid #e5e7eb;
    border-radius: 0.75rem;
    font-size: 1rem;
    outline: none;
    transition: border-color 0.2s;
}

.search-box input:focus {
    border-color: #f9931e;
}

.search-icon {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #9ca3af;
}

.client-item {
    display: flex;
    align-items: center;
    padding: 1rem;
    background: #f9fafb;
    border-radius: 0.75rem;
    margin-bottom: 0.75rem;
    cursor: pointer;
    transition: background 0.2s;
}

.client-item:hover {
    background: #f3f4f6;
}

.client-avatar {
    width: 40px;
    height: 40px;
    background: #e0f2fe;
    color: #0ea5e9;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 1rem;
}

.client-info {
    flex: 1;
}

.client-name {
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 0.25rem;
}

.client-detail {
    font-size: 0.85rem;
    color: #6b7280;
}

.arrow-icon {
    color: #d1d5db;
}

.modal-footer {
    padding: 1rem;
    border-top: 1px solid #f3f4f6;
    display: flex;
    justify-content: center;
}

.btn-clear {
    color: #ef4444;
    background: #fee2e2;
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    border: none;
    font-weight: 600;
    cursor: pointer;
    width: 100%;
}

.placeholder-text,
.no-results,
.loading-state {
    text-align: center;
    color: #9ca3af;
    padding: 2rem 0;
}
</style>
