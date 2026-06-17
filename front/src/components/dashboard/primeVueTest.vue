
<template>
    <div class="card flex justify-center">
        <DatePicker v-model="date" />
    </div>
</template>

<script>
import { DatePicker } from 'primevue';
export default {
    components: {
        DatePicker
    },
    data() {
        return {
            date: null
        };
    }
};
</script>