module.exports = {
  moduleFileExtensions: ['js', 'json', 'vue'],
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.js$": "babel-jest",
    ".*\\.(vue)$": "@vue/vue3-jest",
  },
  transformIgnorePatterns: ['/node_modules/']
}
