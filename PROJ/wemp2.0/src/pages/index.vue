<template>
  <v-container fluid>
    <v-container
      class="hero-section text-center py-16 d-flex flex-column align-center"
      fluid
    >
      <v-row justify="center" align="center">
        <v-col cols="12" md="6">
          <h1 class="display-2 font-weight-bold">WEMP</h1>
          <p class="text-h5">
            Unleashing the power of water and health insights for a sustainable
            FUTURE
          </p>
          <v-row>
            <v-textarea label="Label" variant="solo-filled"></v-textarea>
          </v-row>
        </v-col>
      </v-row>
    </v-container>

    <v-container class="info-section py-12" fluid>
      <v-row>
        <v-col cols="12" md="4" class="text-center">
          <v-img
            src="@/assets/logo.png"
            alt="Feature 1"
            max-height="200"
            contain
          />
          <h3 class="mt-3">AI Insights</h3>
          <p>
            Leverage advanced AI-driven insights to guide your decision-making
            processes.
          </p>
        </v-col>

        <v-col cols="12" md="4" class="text-center">
          <v-img
            src="@/assets/logo.png"
            alt="Feature 2"
            max-height="200"
            contain
          />
          <h3 class="mt-3">Business Feasibility</h3>
          <p>
            Unlock new opportunities and assess your business' potential with
            our analytics.
          </p>
        </v-col>

        <v-col cols="12" md="4" class="text-center">
          <v-img
            src="@/assets/logo.png"
            alt="Feature 3"
            max-height="200"
            contain
          />
          <h3 class="mt-3">Data Visualization</h3>
          <p>
            Transform raw data into actionable insights with interactive data
            visualizations.
          </p>
        </v-col>
      </v-row>
    </v-container>

    <v-container class="cta-section py-12 text-center" fluid>
      <h2 class="display-1">Ready to Get Started?</h2>
      <v-btn color="secondary" large class="mt-4" @click="goToSignup">
        Sign Up Now
      </v-btn>
    </v-container>
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
