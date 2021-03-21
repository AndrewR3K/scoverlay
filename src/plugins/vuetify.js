import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';

Vue.use(Vuetify);

export default new Vuetify({
    theme: {
        themes: {
          light: {
            primary: '#525258',
            secondary: '#1C3B56',
            accent: '#8D8FCA',
            error: '#C3463F',
            info: '#2196F3',
            success: '#4CAF50',
            warning: '#FFC107'
          },
        },
      },
});
