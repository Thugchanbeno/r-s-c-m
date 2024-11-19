<template>
  <v-app>
    <v-app-bar color="primary" dark flat app>
      <v-container class="d-flex align-center justify-space-between" fluid>
        <v-img
          src="@/assets/wemp-logo.png"
          alt="Logo"
          max-height="50"
          contain
        />

        <v-row class="d-flex align-center">
          <v-btn text>Home</v-btn>
          <v-btn text>Create Account</v-btn>
          <v-btn outlined color="white">Sign In</v-btn>
        </v-row>
      </v-container>
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>

    <v-footer color="light green-lighten-5" padless>
      <v-container class="d-flex justify-space-between py-4" fluid>
        <v-col>
          <v-img
            src="@/assets/wemp-logo.png"
            alt="Footer Logo"
            max-height="30"
            contain
          />
          <p class="text-white mt-1">&copy; All Rights Reserved 2024</p>
        </v-col>

        <v-col>
          <p class="text-white mb-1">Products</p>
          <v-list-item class="text-white">AI Predictions</v-list-item>
          <v-list-item class="text-white">Business Feasibility</v-list-item>
          <v-list-item class="text-white">Data Visualization</v-list-item>
        </v-col>

        <v-col>
          <p class="text-white mb-1">Resources</p>
          <v-list-item class="text-white">Feedback</v-list-item>
          <v-list-item class="text-white">Survey</v-list-item>
          <v-list-item class="text-white">Citations</v-list-item>
        </v-col>
      </v-container>
    </v-footer>
  </v-app>
</template>

<script>
export default {
  name: "DefaultLayout",
};
</script>

<style scoped>
.v-app-bar {
  padding: 0 16px;
}
.v-main {
  min-height: calc(100vh - 128px);
}
.v-footer {
  background-color: #8bc34a;
}
</style>
