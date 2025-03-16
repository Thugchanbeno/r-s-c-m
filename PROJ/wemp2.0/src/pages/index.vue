<template>
  <v-container fluid>
    <v-row justify="center" class="text-center pa-4">
      <v-col class="c-margin" cols="12">
        <h1 class="custom-font">WEMP</h1>
        <p class="text-h5 font-weight-medium mb-1">
          Unleashing the Power of Water and Health Insights for a Sustainable
          Future
        </p>
      </v-col>
    </v-row>
    <v-row justify="center" class="pa-2 mt-2">
      <v-col cols="12" md="4">
        <v-text-field
          bg-color="white"
          class="pa-2"
          label="Search"
          variant="outlined"
          prepend-inner-icon="mdi-magnify"
          @click:append-inner=""
          rounded="xl"
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field
          bg-color="white"
          class="pa-2"
          label="Region"
          variant="outlined"
          prepend-inner-icon="mdi-magnify"
          @click:append-inner=""
          rounded="xl"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <h3 class="mx-4">WATER AND HEALTH INSIGHTS</h3>
      </v-col>
      <v-col cols="12" md="6">
        <v-card class="pa-4 mx-2" rounded="xl">
          <v-img
            src="@/assets/logo large.png"
            alt="Feature 1"
            max-height="200"
            contain
          />
          <p class="text-h6 mx-1">Water Quantity per County</p>
          <p class="pa-1">Summary</p>
          <p class="pa-1">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquam.
          </p>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card class="pa-4 mx-2" rounded="xl">
          <v-img
            src="@/assets/logo large.png"
            alt="Feature 2"
            max-height="200"
            contain
          />
          <p class="text-h6 mx-1">Population with Access to Water</p>
          <p class="pa-1">Summary</p>
          <p class="pa-1">
            Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet
            sint.
          </p>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mb-16">
      <v-col cols="12">
        <h3 class="mx-4">DISCOVER</h3>
      </v-col>
      <v-col cols="12" md="6">
        <v-card class="pa-4 mx-2" rounded="xl">
          <v-img
            src="@/assets/logo large.png"
            alt="Feature 1"
            max-height="200"
            contain
          />
          <p class="text-h6 mx-1">Data Visualizations</p>
          <p class="pa-1">
            Visualize water consumption patterns and regional comparisons
            through in-depth trend charts.
          </p>
          <v-btn
            variant="text"
            rounded="xl"
            class="pa-1"
            color="blue"
            @click="navigateToDataViz"
            >View More</v-btn
          >
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card class="pa-4" rounded="xl">
          <v-img
            src="@/assets/logo large.png"
            alt="Feature 2"
            max-height="200"
            contain
          />
          <p class="text-h6 mx-1">Heat Maps</p>
          <p class="pa-1">
            Compare regional disparities and visualize water consumption habits
            through interactive heat maps.
          </p>
          <v-btn
            variant="text"
            rounded="xl"
            class="pa-1"
            color="blue"
            @click="navigateToHeatMaps"
            >View More</v-btn
          >
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card class="pa-4" rounded="xl">
          <v-img
            src="@/assets/logo large.png"
            alt="Feature 1"
            max-height="200"
            contain
          />
          <p class="text-h6 mx-1">AI Predictions</p>
          <p class="pa-1">
            Access in-depth data on demand, revenue opportunities, and market
            trends for sustainable growth.
          </p>
          <v-btn
            variant="text"
            rounded="xl"
            class="pa-1"
            color="blue"
            @click="navigateToAiPredictions"
            text
            >View More</v-btn
          >
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card class="pa-4" rounded="xl">
          <v-img
            src="@/assets/logo large.png"
            alt="Feature 2"
            max-height="200"
            contain
          />
          <p class="text-h6 mx-1">Business Feasibility Reports</p>
          <p class="pa-1">
            Access in-depth data on demand, revenue opportunities, and market
            trends for sustainable growth.
          </p>
          <v-btn
            variant="text"
            rounded="xl"
            class="pa-1"
            color="blue"
            @click="navigateToFeasibility"
            text
            >View More</v-btn
          >
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: "HomePage",
  methods: {
    navigateToAiPredictions() {
      this.$router.push("/aipredictions");
    },
    navigateToFeasibility() {
      this.$router.push("/feasibility");
    },
    navigateToHeatMaps() {
      this.$router.push("/heatmaps");
    },
    navigateToDataViz() {
      this.$router.push("/dataviz");
    },
    goToSignup() {
      this.$router.push("/signup");
    },
  },
};
</script>

<style scoped>
.custom-font {
  font-size: 61px;
}
.info-section .v-img {
  max-width: 100%;
}
.cta-section {
  background-color: #f5f5f5;
  padding: 48px;
}
.text-center {
  text-align: center;
}
.py-12 {
  padding-top: 48px;
  padding-bottom: 48px;
}
.mt-4 {
  margin-top: 16px;
}
.mt-3 {
  margin-top: 12px;
}
</style>
