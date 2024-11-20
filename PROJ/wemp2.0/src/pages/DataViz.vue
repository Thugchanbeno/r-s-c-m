<template>
  <div class="pa-4">
    <v-row cols="auto" justify="space-around" mt="1rem">
      <v-text-field label="search"></v-text-field>
      <v-text-field label="search"></v-text-field>
    </v-row>
    <div class="text-center mb-8">
      <h1 class="text-h4 font-weight-bold mb-2">
        Water Access in Kenya: Regional Disparities
      </h1>
      <p class="text-body-1">
        This is an overview of the number of people who have access to safe
        drinking water in Kenya.
      </p>

      <v-select
        class="mt-4"
        label="Region"
        :items="regions"
        v-model="selectedRegion"
        dense
        outlined
      ></v-select>
    </div>

    <div class="mb-8">
      <h2 class="text-h5 font-weight-medium text-center mb-1">
        City Population
      </h2>
      <p class="text-body-2 text-center mb-4">Estimated by borough</p>
      <div class="d-flex justify-center">
        <img
          src="@/assets/logo large.png"
          alt="Line Chart Placeholder"
          class="rounded elevation-1"
          style="max-width: 800px; width: 100%"
        />
      </div>
    </div>

    <v-divider class="my-8"></v-divider>

    <div class="d-flex flex-column">
      <v-chip color="secondary" variant="tonal"> AI predictions </v-chip>
      <h2 class="text-h5 font-weight-medium text-center mb-1">
        Relevant AI Predictions
      </h2>
      <p class="text-body-1 text-center mb-4">
        This is an overview of the number of people who have access to safe
        drinking water in Kenya.
      </p>

      <v-select
        class="mt-2"
        label="Region"
        :items="regions"
        v-model="selectedRegion"
        dense
        outlined
      ></v-select>

      <div class="d-flex justify-center mt-4">
        <img
          src="@/assets/logo large.png"
          alt="Bar Chart Placeholder"
          class="rounded elevation-1"
          style="max-width: 800px; width: 100%"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      regions: ["Nairobi", "Nakuru", "Mombasa", "Kisumu", "Embu"],
      selectedRegion: "",
    };
  },
};
</script>
