<template>
  <v-app>
    <v-app-bar border color="F8F9FA" elevation="0" height="70">
      <v-container>
        <v-row align="center" justify="space-between" no-gutters>
          <v-col cols="auto">
            <v-img
              src="@/assets/logo large.png"
              alt="Wemp Logo"
              width="100"
              height="100"
            />
          </v-col>

          <v-col cols="auto" class="d-flex flex-wrap justify-end">
            <v-btn
              variant="plain"
              class="pa-2 mx-2"
              color="#3D23E7"
              rounded="xl"
              @click="navigateToIndex"
            >
              Home
            </v-btn>
            <v-btn
              variant="tonal"
              class="pa-2 mx-2"
              color="#3D23E7"
              rounded="xl"
              @click="navigateToSignUp"
            >
              Create Account
            </v-btn>
            <v-btn
              variant="outlined"
              class="pa-2 mx-2"
              color="#3D23E7"
              rounded="xl"
              bg-color="#3D23E7"
              @click="navigateToSignIn"
            >
              Sign In
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-app-bar>
    <v-main>
      <router-view />
    </v-main>

    <v-footer border color="#FFFFFF" app>
      <v-container>
        <v-row justify="space-around">
          <v-col cols="auto" class="pa-2 mx-4">
            <v-img src="@/assets/logo large.png" alt="Footer Logo" />
            <span class="pa-2 resources">&copy; All Rights Reserved 2024</span>
          </v-col>

          <v-col cols="auto" justify="end">
            <v-row>
              <v-col cols="auto" class="pa-4">
                <h4 class="pa-2 font-weight-bold products">Products</h4>
                <div class="pa-2">
                  <div class="products"><a>AI Predictions</a></div>
                  <div class="products">
                    <a>Business Feasibility</a>
                  </div>
                  <div class="products"><a>Data Visualization</a></div>
                </div>
              </v-col>
              <v-col cols="auto" class="pa-4">
                <h4 class="pa-2 font-weight-bold products">Resources</h4>
                <div class="pa-2">
                  <div class="resources"><a>Feedback</a></div>
                  <div class="resources"><a>Survey</a></div>
                  <div class="resources"><a>Release Notes</a></div>
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
    navigateToSignIn() {
      this.$router.push("/signin");
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
