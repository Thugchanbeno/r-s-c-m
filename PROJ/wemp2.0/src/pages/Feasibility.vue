<template>
  <div class="d-flex flex-column pa-4">
    <div class="d-flex flex-column pa-4">
      <h1 class="pa-2">Business feasibilty report</h1>
      <p class="pa-2">
        access in-depth data on demand, revenue opportunities and market trends
        for sustainable growth
      </p>
    </div>
    <v-row class="pa-4">
      <v-col cols="12" md="8" class="pa-4">
        <v-text-field
          variant="outlined"
          append-inner-icon="mdi-magnify"
          @click:append-inner=""
          label="search"
          rounded="xl"
          bg-color="#FFFFFF"
        />
      </v-col>
      <v-col cols="12" md="4" class="pa-4">
        <v-select
          label="Region"
          :items="regions"
          v-model="selectedRegion"
          variant="outlined"
          rounded="xl"
          bg-color="#FFFFFF"
        ></v-select>
      </v-col>
    </v-row>
    <v-divider class="my-4"></v-divider>
    <v-row class="d-flex pa-4">
      <v-col cols="12" class="pa-4">
        <v-card
          subtitle="Business feasibility(AI generated report)"
          title="Relevant Data()"
          text="..............."
          min-height="300"
          rounded="xl"
        />
      </v-col>
    </v-row>
  </div>
</template>
<script>
export default {
  name: "feasibility",
  methods: {},
  data() {
    return {
      regions: ["Nairobi", "Nakuru", "Mombasa", "Kisumu", "Embu"],
      selectedRegion: "",
    };
  },
};
</script>
