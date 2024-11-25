<template>
  <v-container class="py-12 d-flex justify-center">
    <v-card
      class="pa-4"
      elevation="2"
      color="#F8F9FA"
      min-height="550"
      min-width="500"
    >
      <v-card-title class="text-h5 font-weight-bold text-center">
        Create Account
      </v-card-title>
      <v-card-subtitle class="text-center">
        Join now for full access to water insights and predictions.
      </v-card-subtitle>

      <v-card-text>
        <v-form>
          <v-row>
            <v-col cols="12" md="6" class="pa-4">
              <v-text-field
                variant="outlined"
                rounded="xl"
                density="comfortable"
                bg-color="white"
                label="First Name"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6" class="pa-4">
              <v-text-field
                variant="outlined"
                rounded="xl"
                density="comfortable"
                label="Last Name"
                bg-color="white"
                required
              ></v-text-field>
            </v-col>
          </v-row>

          <v-text-field
            class="my-2"
            variant="outlined"
            bg-color="white"
            density="comfortable"
            label="Email Address"
            required
            rounded="xl"
          ></v-text-field>

          <v-row>
            <v-col cols="12" md="6" class="pa-4">
              <v-text-field
                density="comfortable"
                bg-color="white"
                variant="outlined"
                label="Password *"
                rounded="xl"
                v-model="password"
                :type="passwordFieldType"
                :append-inner-icon="
                  passwordFieldType === 'password' ? 'mdi-eye-off' : 'mdi-eye'
                "
                @click:append-inner="togglePasswordVisibility"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6" class="pa-4">
              <v-text-field
                density="comfortable"
                bg-color="white"
                variant="outlined"
                label="Confirm Password *"
                rounded="xl"
                v-model="passwordConfirm"
                :type="passwordConfirmFieldType"
                :append-inner-icon="
                  passwordConfirmFieldType === 'password'
                    ? 'mdi-eye-off'
                    : 'mdi-eye'
                "
                @click:append-inner="togglePasswordConfirmVisibility"
              ></v-text-field>
            </v-col>
          </v-row>

          <div class="text-center">
            Already have an Account?
            <v-btn color="#3D23E7" variant="text">Log In</v-btn>
          </div>

          <v-btn class="pa-4 my-2" color="#3D23E7" rounded="xl" block>
            Sign Up
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
export default {
  name: "SignUp",
  data() {
    return {
      password: "",
      passwordConfirm: "",
      passwordFieldType: "password",
      passwordConfirmFieldType: "password",
    };
  },
  methods: {
    togglePasswordVisibility() {
      this.passwordFieldType =
        this.passwordFieldType === "password" ? "text" : "password";
    },

    togglePasswordConfirmVisibility() {
      this.passwordConfirmFieldType =
        this.passwordConfirmFieldType === "password" ? "text" : "password";
    },
  },
};
</script>

<style scoped>
.v-card {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
</style>
