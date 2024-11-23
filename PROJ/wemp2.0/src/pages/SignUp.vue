<template>
  <v-container class="py-12 d-flex justify-center">
    <v-card max-width="600" class="pa-6">
      <v-card-title class="text-h5 font-weight-bold">
        Create Account
      </v-card-title>
      <v-card-subtitle>
        Join now for full access to water insights and predictions.
      </v-card-subtitle>

      <v-card-text>
        <v-form>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field label="First Name" required></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field label="Last Name" required></v-text-field>
            </v-col>
          </v-row>

          <v-text-field label="Email Address" required></v-text-field>

          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                density="compact"
                bg-color="white"
                variant="solo"
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
            <v-col cols="12" md="6">
              <v-text-field
                density="compact"
                bg-color="white"
                variant="solo"
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

          <v-btn class="mt-4" color="primary" block> Sign Up </v-btn>

          <div class="mt-2 text-center">
            Already have an Account?
            <v-btn color="primary">Log In</v-btn>
          </div>
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
