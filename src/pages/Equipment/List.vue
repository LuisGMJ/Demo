<!-- eslint-disable vue/multi-word-component-names -->
<template>
    <div class="q-pa-md">
      <q-table
        flat bordered
        title="Equipos medicos"
        :rows="items.equipos"
        :columns="columns"
        row-key="name"
        :filter="filter"
        :pagination="initialPagination"
        rows-per-page-label="Registros por página"
        no-data-label="No se encontraron registros"
      >
        <template v-slot:top-right>
          <q-input borderless dense debounce="300" v-model="filter" placeholder="Buscar...">
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
          <q-btn color="primary" label="Agregar" @click="openForm" />
          <q-dialog v-model="prompt" persistent>
            <q-card style="min-width: 350px">
              <q-form @submit.prevent="handleSubmit()">
                <q-card-section>
                  <div class="text-h6">{{ form.id ? 'Editar' : 'Agregar' }} Equipo Medico</div>
                  <q-input type="text" clearable v-model="form.name" name="name" label="Nombre *" />
                  <q-input type="text" clearable v-model="form.brand" name="brand" label="Marca *" />
                  <q-input type="text" clearable v-model="form.model" name="model" label="Modelo *" />
                  <q-input type="text" clearable v-model="form.serial_number" name="serial_number" label="Número de serie *" />
                  <q-input type="text" clearable v-model="form.image" name="image" label="Url de imagen *" />
                </q-card-section>
                  <!-- Add more input fields as needed -->
                <q-card-actions align="right" class="text-primary">
                  <q-btn flat label="Cancelar" v-close-popup />
                  <q-btn flat :label="form.id ? 'Actualizar' : 'Agregar'" @click="handleAddOrUpdate()" />
                </q-card-actions>
              </q-form>
            </q-card>
          </q-dialog>
        </template>
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="image" :props="props">
              <q-avatar>
                <img :src="props.row.image">
              </q-avatar>
            </q-td>
            <q-td key="name" :props="props">
              {{ props.row.name }}
            </q-td>
            <q-td key="brand" :props="props">
              <q-badge color="purple">
                {{ props.row.brand }}
              </q-badge>
            </q-td>
            <q-td key="model" :props="props">
              <q-badge color="orange">
                {{ props.row.model }}
              </q-badge>
            </q-td>
            <q-td key="serial_number" :props="props">
              <q-badge color="primary">
                {{ props.row.serial_number }}
              </q-badge>
            </q-td>
            <q-td key="serial_number" :props="props">
              <q-btn round color="primary" @click="openForm(props.row)" icon="edit">
                <template v-slot:loading>
                  <q-spinner-gears />
                </template>
              </q-btn>
              <q-btn round color="red" @click="openConfirmDelete(props.row.id)" icon="delete">
                <template v-slot:loading>
                  <q-spinner-gears />
                </template>
              </q-btn>
            </q-td>
          </q-tr>
        </template>
      </q-table>
      <q-dialog v-model="confirmDelete" persistent>
        <q-card style="min-width: 350px">
          <q-card-section>
            <div class="text-h6">¿Estás seguro de que quieres eliminar este equipo?</div>
          </q-card-section>
          <q-card-actions align="right" class="text-primary">
            <q-btn flat label="Cancelar" v-close-popup />
            <q-btn flat label="Eliminar" color="negative" @click="handleConfirmDelete" />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
</template>
<script>
import { ref, onMounted } from 'vue'
import { getEquipments, addEquipment, updateEquipment, deleteEquipment } from '../../services/api'
import { useQuasar } from 'quasar'
const columns = [
  { name: 'image', align: 'center', label: '', field: 'image' },
  {
    name: 'name',
    required: true,
    label: 'Nombre',
    align: 'left',
    field: row => row.name,
    format: val => `${val}`,
    sortable: true
  },
  { name: 'brand', align: 'left', label: 'Marca', field: 'brand', sortable: true },
  { name: 'model', align: 'left', label: 'Modelo', field: 'model', sortable: true },
  { name: 'serial_number', align: 'left', label: 'Número de serie', field: 'serial_number' },
  { name: 'actions', align: 'center', label: '', field: 'actions' }
]
let rows = []
export default {
  setup () {
    const items = ref([])
    const loading = ref(false)
    const name = ref(null)
    const form = ref({
      name: '',
      id: '',
      brand: '',
      model: '',
      serial_number: ''
    })
    const prompt = ref(false)
    onMounted(async () => {
      try {
        items.value = await getEquipments()
        rows = items.value.equipos
        console.log(items.value.equipos)
      } catch (error) {
        console.error('Error al obtener los equipos', error)
      }
    })
    const $q = useQuasar()
    const handleSubmit = async () => {
      try {
        await addEquipment(form.value)
        items.value = await getEquipments()
        rows = items.value.equipos
        $q.notify({ message: 'El equipo se agrego correctamente', icon: 'check', color: 'positive' })
      } catch (error) {
        throw new Error(error)
      }
    }
    const handleUpdate = async () => {
      try {
        const result = await updateEquipment(form.value.id, form.value)
        console.log('Equipo actualizado exitosamente:', result)
        $q.notify({ message: 'El equipo se actualizo correctamente', icon: 'check', color: 'positive' })
      } catch (error) {
        console.error('Error al actualizar equipo:', error)
      }
    }
    const showErrorNotification = (message) => {
      $q.notify({ message, icon: 'report_problem', color: 'negative' })
    }
    const handleAddOrUpdate = async () => {
      try {
        if (form.value.id) {
          await handleUpdate()
        } else {
          await handleSubmit()
        }
        closeForm()
      } catch (error) {
        showErrorNotification('Error al procesar la operación.')
        console.error(error)
      }
    }
    const handleDelete = async (id) => {
      console.log(rows, id)
      try {
        // Eliminar del servicio
        await deleteEquipment(id)

        // Eliminar de la matriz local (rows)
        const indexToDelete = rows.findIndex(item => item.id === id)
        if (indexToDelete !== -1) {
          rows.splice(indexToDelete, 1)
        }

        $q.notify({ message: 'Equipo eliminado exitosamente', icon: 'check', color: 'positive' })
      } catch (error) {
        showErrorNotification('Error al eliminar el equipo.')
        console.error(error)
      }
    }
    const openForm = (row = null) => {
      if (row) {
        form.value = row
      } else {
        resetForm()
      }
      prompt.value = true
    }
    const resetForm = () => {
      form.value = {
        name: '',
        id: '',
        brand: '',
        model: '',
        serial_number: ''
      }
    }
    const closeForm = () => {
      prompt.value = false
      resetForm()
    }
    const confirmDelete = ref(false)
    const deleteItemId = ref(null)
    const openConfirmDelete = (id) => {
      deleteItemId.value = id
      confirmDelete.value = true
    }
    const handleConfirmDelete = async () => {
      if (deleteItemId.value) {
        await handleDelete(deleteItemId.value)
        closeConfirmDelete()
      }
    }
    const closeConfirmDelete = () => {
      confirmDelete.value = false
      deleteItemId.value = null
    }
    return {
      name,
      filter: ref(''),
      prompt,
      columns,
      rows,
      items,
      initialPagination: {
        sortBy: 'desc',
        descending: false,
        page: 1,
        rowsPerPage: 5,
        loading
      },
      handleAddOrUpdate,
      handleSubmit,
      handleUpdate,
      handleDelete,
      openForm,
      form,
      resetForm,
      closeForm,
      confirmDelete,
      openConfirmDelete,
      handleConfirmDelete,
      closeConfirmDelete
    }
  }
}
</script>
