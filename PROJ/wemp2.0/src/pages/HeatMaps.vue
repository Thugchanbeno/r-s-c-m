<template>
  <div class="d-flex flex-column pa-4">
    <v-row class="pa-4">
      <v-col cols="12" md="8" class="pa-4">
        <v-text-field
          bg-color="#FFFFFF"
          variant="outlined"
          prepend-inner-icon="mdi-magnify"
          label="search"
          placeholder="keywords"
          rounded="xl"
        />
      </v-col>
      <v-col cols="12" md="4" class="pa-4">
        <v-text-field
          bg-color="#FFFFFF"
          variant="outlined"
          prepend-inner-icon="mdi-magnify"
          label="region"
          placeholder="county"
          rounded="xl"
        />
      </v-col>
    </v-row>
    <v-divider class="my-2"></v-divider>
    <div class="pa-4">
      <h1 class="text-h4 font-weight-bold pa-2">
        Water Access in Kenya: Regional Disparities
      </h1>
      <p class="text-body-1 pa-2">
        This is an overview of the number of people who have access to safe
        drinking water in Kenya.
      </p>

      <v-select
        class="pa-2"
        label="Region"
        :items="regions"
        v-model="selectedRegion"
        variant="outlined"
        rounded="xl"
        density="comfortable"
        max-width="450"
        bg-color="#FFFFFF"
      ></v-select>
    </div>

    <div class="pa-4">
      <h2 class="text-h5 font-weight-medium pa-2" align="left">
        City Population
      </h2>
      <p class="text-body-2 text-left pa-2">Estimated by borough</p>
      <div class="d-flex justify-left pa-2">
        <img
          src="@/assets/logo large.png"
          alt="Line Chart Placeholder"
          class="rounded"
          style="max-width: 800px; width: 100%"
        />
      </div>
    </div>

    <v-divider class="my-8"></v-divider>
    <div class="pa-4">
      <v-chip prepend-icon="mdi-creation" class="gradient-chip">
        AI predictions
      </v-chip>
    </div>

    <v-row cols="auto">
      <v-col>
        <h2 class="text-h5 font-weight-medium text-left pa-4">
          Relevant AI Predictions
        </h2>
        <p class="text-body-1 text-left pa-4">
          This is an overview of the number of people who have access to safe
          drinking water in Kenya.
        </p>

        <v-select
          class="pa-2"
          label="Region"
          :items="regions"
          v-model="selectedRegion"
          variant="outlined"
          rounded="xl"
          density="comfortable"
          max-width="450"
          bg-color="#FFFFFF"
        ></v-select>

        <div class="d-flex pa-2" align="left">
          <img
            src="@/assets/logo large.png"
            alt="Bar Chart Placeholder"
            class="rounded"
            style="max-width: 800px; width: 100%"
          />
        </div>
      </v-col>
    </v-row>
    <v-divider class="my-2"></v-divider>
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
<style scoped>
.gradient-chip {
  background: linear-gradient(to right, #8a7af0, #21108f);
  color: white;
}
</style>
