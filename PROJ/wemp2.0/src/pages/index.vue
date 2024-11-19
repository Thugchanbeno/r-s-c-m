<template>
  <v-container fluid>
    <v-row justify="center" class="text-center">
      <v-col cols="12">
        <h1 class="mb-2">WEMP</h1>
        <p class="text-h5 font-weight-medium">
          Unleashing the Power of Water and Health Insights for a Sustainable
          Future
        </p>
      </v-col>
    </v-row>
    <v-row justify="center" class="my-4">
      <v-col cols="12" md="4">
        <v-text-field
          class="mb-2"
          dense
          label="Search"
          variant="solo-filled"
          :append-inner-icon="mdi - magnify"
          @click:append-inner=""
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field
          class="mv-2"
          label="Region"
          variant="solo-filled"
          :append-inner-icon="mdi - magnify"
          @click:append-inner=""
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <h3 class="my-3">water and health insights</h3>
      </v-col>
      <v-col cols="12" md="6">
        <v-card class="pa-3">
          <v-img
            src="@/assets/logo large.png"
            alt="Feature 1"
            max-height="200"
            contain
          />
          <p class="text-h6 mt-2">Water Quantity per County</p>
          <p>Summary</p>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit ut aliquam.
          </p>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card class="pa-3">
          <v-img
            src="@/assets/logo large.png"
            alt="Feature 2"
            max-height="200"
            contain
          />
          <p class="text-h6 mt-2">Population with Access to Water</p>
          <p>Summary</p>
          <p>
            Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet
            sint.
          </p>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <h3 class="my-3">discover</h3>
      </v-col>
      <v-col cols="12" md="6">
        <v-card class="pa-3">
          <v-img
            src="@/assets/logo large.png"
            alt="Feature 1"
            max-height="200"
            contain
          />
          <p class="text-h6 mt-2">Data Visualizations</p>
          <p>
            Visualize water consumption patterns and regional comparisons
            through in-depth trend charts.
          </p>
          <v-btn color="primary" text>View More</v-btn>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card class="pa-3">
          <v-img
            src="@/assets/logo large.png"
            alt="Feature 2"
            max-height="200"
            contain
          />
          <p class="text-h6 mt-2">Heat Maps</p>
          <p>
            Compare regional disparities and visualize water consumption habits
            through interactive heat maps.
          </p>
          <v-btn color="primary" text>View More</v-btn>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card class="pa-3">
          <v-img
            src="@/assets/logo large.png"
            alt="Feature 1"
            max-height="200"
            contain
          />
          <p class="text-h6 mt-2">AI Predictions</p>
          <p>
            Access in-depth data on demand, revenue opportunities, and market
            trends for sustainable growth.
          </p>
          <v-btn color="primary" text>View More</v-btn>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card class="pa-3">
          <v-img
            src="@/assets/logo large.png"
            alt="Feature 2"
            max-height="200"
            contain
          />
          <p class="text-h6 mt-2">Business Feasibility Reports</p>
          <p>
            Access in-depth data on demand, revenue opportunities, and market
            trends for sustainable growth.
          </p>
          <v-btn color="primary" text>View More</v-btn>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: "HomePage",
  methods: {
    goToSignup() {
      this.$router.push("/signup");
    },
  },
};
</script>

<style scoped>
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
