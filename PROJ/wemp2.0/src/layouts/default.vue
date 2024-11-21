<template>
  <v-app>
    <v-app-bar app color="white" elevate-on-scroll>
      <v-container>
        <v-row align="center" justify="space-between">
          <v-col cols="auto">
            <v-img
              src="@/assets/logo large.png"
              alt=" Wemp Logo"
              width="80"
              height="80"
            />
          </v-col>
          <v-col cols="auto">
            <v-btn @click="navigateToIndex">Home</v-btn>
            <v-btn class="mx-2" outlined color="black" @click="navigateToSignUp"
              >Create Account</v-btn
            >
            <v-btn outlined color="primary" href="#">Sign In</v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>

    <v-footer app>
      <v-container>
        <v-row justify="space-around">
          <v-col cols="auto">
            <v-img
              src="@/assets/logo large.png"
              alt="Footer Logo"
              width="80"
              height="80"
            />
            <span class="ml-2 resources">&copy; All Rights Reserved 2024</span>
          </v-col>

          <v-col cols="auto" justify="end">
            <v-row>
              <v-col cols="auto">
                <h4 class="mb-1 font-weight-bold">Products</h4>
                <div class="pa-0 ma-0 products">
                  <div class="products"><a href="#">AI Predictions</a></div>
                  <div class="products">
                    <a href="#">Business Feasibility</a>
                  </div>
                  <div class="products"><a href="#">Data Visualization</a></div>
                </div>
              </v-col>
              <v-col cols="auto">
                <h4 class="mb-1 font-weight-bold">Resources</h4>
                <div class="pa-0 ma-0 resources">
                  <div class="resources"><a href="#">Feedback</a></div>
                  <div class="resources"><a href="#">Survey</a></div>
                  <div class="resources"><a href="#">Release Notes</a></div>
                </div>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-container>
    </v-footer>
  </v-app>
</template>

<script>
export default {
  name: "DefaultLayout",
  methods: {
    navigateToSignUp() {
      this.$router.push("/SignUp");
    },
    navigateToIndex() {
      this.$router.push("/");
    },
  },
};
</script>

<style scoped>
.v-app-bar {
  padding: 0 16px;
}
.v-main {
  min-height: calc(100vh - 128px);
  background-color: #f8f9fa;
}
.v-footer {
  background-color: #f8f9fa;
  padding-top: 1rem;
}
.resources {
  transition: transform 0.3s, color 0.3s;
}
.resources:hover {
  color: #59ef0d;
  transform: translateX(8px);
}
.products {
  transition: transform 0.3s, color 0.3s;
}
.products:hover {
  color: #57f004;
  transform: translateX(8px);
}
</style>
