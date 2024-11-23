<template>
  <div class="d-flex flex-column pa-4" align="left">
    <h1 class="pa-2">Business feasibilty report</h1>
    <p class="pa-2">
      access in-depth data on demand, revenue opportunities and market trends
      for sustainable growth
    </p>
  </div>
  <v-row cols="auto" class="d-flex align-items pa-4">
    <v-col cols="8" class="pa-4">
      <v-text-field
        variant="outlined"
        append-inner-icon="mdi-magnify"
        @click:append-inner=""
        label="search"
        rounded="xl"
        bg-color="#FFFFFF"
      />
    </v-col>
    <v-col cols="4" class="pa-4">
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
  <v-row class="d-flex ma-2">
    <v-col cols="12" align="left" class="pa-4">
      <v-card
        subtitle="Business feasibility(AI generated report)"
        title="Relevant Data()"
        text="..............."
        min-height="300"
      />
    </v-col>
  </v-row>
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
