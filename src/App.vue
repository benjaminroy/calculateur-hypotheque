<template>
  <div class="py-3" style="background-color: #f1f1f1; margin-bottom: 1.5rem;">
    <div class="container">
      <!-- H1 -->
      <div class="row mb-5">
        <div class="col">
          <h1 class="text-center">Planificateur financier de l'achat d'une maison</h1>
        </div>
      </div>

      <div class="row justify-content-center mb-4">
        <div class="col-md-6">
          <div class="row">
            <div class="col">
              <label class="form-label fw-bold">Prix de la maison</label>
              <div class="input-group">
                <span class="input-group-text">$</span>
                <input class="form-control" type="number" min="0" v-model="price" />
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="row mb-3">
            <div class="col">
              <label class="form-label fw-bold">Date de l'achat de la maison</label>
              <input class="form-control" type="date" :value="currentDate.toJSON().substring(0,10)" @input="currentDate = new Date($event.target.value)" />
            </div>
          </div>

          <div class="row mb-3">
            <div class="col">
              <div class="fs-4">Paramètres avancés</div>
            </div>
          </div>

          <div class="row mb-3">
            <div class="col">
              <label class="form-label fw-bold">Estimation du taux de rendement sur les investissements</label>
              <input class="form-control" type="number" min="0" v-model="averageAnnualReturnRate" />
            </div>
          </div>

          <div class="row mb-3">
            <div class="col">
              <label class="form-label fw-bold">Pourcentage des gains imposés</label>
              <input class="form-control" type="number" value="0.5" disabled />
              <small>Les gains en capital sont imposables à 50%.</small>
            </div>
          </div>

          <div class="row mb-3">
            <div class="col">
              <label class="form-label fw-bold">Estimation du barème d'imposition</label>
              <input class="form-control" type="number" value="0.5331" disabled />
              <small>Le barème d'imposition le plus élevé est de 53,31%.</small>
            </div>
          </div>

          <div class="row">
            <div class="col">
              <label class="form-label fw-bold">Montant total du RAP à rembourser</label>
              <input class="form-control" type="number" min="0" max="70000" disabled />
              <small>Le plafond du RAP est de 35 000$ par personne.</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="container py-3">
    <!-- Form -->
    <form @submit.prevent="calculate()">
      <div class="row justify-content-center mb-n4">
        <template v-for="(option, optionIndex) in options" :key="optionIndex">
          <div class="col-md-6 mb-4">
            <div class="row mb-3">
              <div class="col">
                <div class="fs-4">Option #{{ optionIndex + 1 }}</div>
              </div>
            </div>

            <div class="box">
              <div class="row mb-n3">
                <div class="col-12 mb-3">
                  <label class="form-label fw-bold">Mise de fonds (%)</label>
                  <select class="custom-select form-control" v-model="options[optionIndex].downPaymentPercentage">
                    <option value="0.05">5%</option>
                    <option value="0.1">10%</option>
                    <option value="0.15">15%</option>
                    <option value="0.2">20%</option>
                  </select>
                </div>

                <div class="col-md-6 mb-3">
                  <label class="form-label fw-bold">Taux d'intérêt</label>
                  <input class="form-control" type="number" min="0" v-model="options[optionIndex].mortageRate" />
                  <small>Supposons un taux d'intérêt constant.</small>
                </div>

                <div class="col-md-6 mb-3">
                  <label class="form-label fw-bold">Amortissement</label>
                  <select class="form-control custom-select" v-model="options[optionIndex].amortization" required>
                    <option value=""></option>
                    <option value="5">5 ans</option>
                    <option value="10">10 ans</option>
                    <option value="15">15 ans</option>
                    <option value="20">20 ans</option>
                    <option value="25">25 ans</option>
                    <option value="30">30 ans</option>
                  </select>
                </div>

                <div class="col-12 mb-3 mt-4">
                  <span class="form-label fw-bold">Mise de fonds ($)</span><br>
                  {{ formatMoney(options[optionIndex].downPaymentPercentage * price) }} $
                </div>

                <div class="col-md-6 mb-3">
                  <span class="form-label fw-bold">Valeur de l'hypothèque</span><br>
                  {{ formatMoney(getMortageAmount(optionIndex)) }} $
                </div>

                <div class="col-md-6 mb-3">
                  <span class="form-label fw-bold">Assurance prêt hypothècaire</span><br>
                  {{ formatMoney(getMortageProtectionInsurance(optionIndex)) }} $
                </div>

                <div class="col-12 mb-3">
                  <span class="form-label fw-bold">Valeur de l'hypothèque incluant l'assurance prêt hypothaire</span><br>
                  {{ formatMoney(getTotalMortageAmount(optionIndex)) }} $
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>

      <div class="row mt-4">
        <div class="col text-center">
          <button type="submit" @click.prevent="calculate()" class="btn btn-primary btn-lg">
            Calculer
          </button>
        </div>
      </div>
    </form>

    <hr class="my-5">

    <!-- Results -->
    <template v-if="!isLoading">
      <ul id="pills-tab"  class="nav nav-pills mb-3" role="tablist">
        <template v-for="(option, optionIndex) in data" :key="optionIndex">
          <li class="nav-item" role="presentation">
            <button :id="'#option-' + optionIndex + '-tab'" class="nav-link" :class="{ 'active': optionIndex === 0 }" data-bs-toggle="pill" :data-bs-target="'#option-' + optionIndex" type="button" role="tab" :aria-controls="'#option-' + optionIndex" aria-selected="true">
              Option #{{ optionIndex + 1 }}
            </button>
          </li>
        </template>
      </ul>

      <div class="tab-content" id="pills-tabContent">
        <template v-for="(option, optionIndex) in data" :key="optionIndex">
          <div :id="'option-' + optionIndex" class="tab-pane fade" :class="{ 'active show': optionIndex === 0 }" role="tabpanel" :aria-labelledby="'option-' + optionIndex + '-tab'">
            <div style="overflow-x: auto; max-width: 100%;">
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th scope="col">#Mois</th>
                    <th scope="col">Date</th>
                    <th scope="col">Versements</th>
                    <th scope="col">Investissements</th>
                    <th scope="col">Intérêts sur investissements</th>
                    <th scope="col">Valeur totale du portefeuille</th>
                  </tr>
                </thead>
                <tbody>
                  <template v-for="(item, itemIndex) in option" :key="itemIndex">
                    <tr>
                      <th>#{{ itemIndex + 1 }}</th>
                      <th>{{ new Date(currentDate.getYear() + 1900, currentDate.getMonth() + itemIndex + 1, 1).toDateString() }}</th>
                      <th>{{ formatMoney(item.monthlyPayment) }}$</th>
                      <th>{{ formatMoney(item.monthlyContribution) }}$</th>
                      <th>{{ formatMoney(item.totalInterests) }}$</th>
                      <th>{{ formatMoney(item.futureValue) }}$</th>
                    </tr>
                  </template>
                </tbody>
                <tfoot>
                  <tr>
                    <td></td>
                    <td></td>
                    <td class="fw-bold text-danger">{{ formatMoney(getTotalPayments(optionIndex)) }}$</td>
                    <td></td>
                    <td></td>
                    <td class="fw-bold text-success">
                      <span v-if="option[option.length - 1] && option[option.length - 1].futureValue">
                        {{ formatMoney(option[option.length - 1].futureValue) }}$
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </template>
      </div>
    </template>

    <!-- Loading -->
    <div class="row mt-5" v-else>
      <div class="col text-center">
        Chargement...
      </div>
    </div>
  </div>
</template>

<script>

const MAXIMUM_TAX_RATE = 0.5331;
const NUMBER_OF_MONTHS = 12;

export default {
  name: 'App',
  data() {
    return {
      averageAnnualReturnRate: 0.07,
      currentDate: new Date(),
      data: null,
      isLoading: false,
      price: 500000,
      taxRate: MAXIMUM_TAX_RATE,
      options: [
        {
          amortization: 25,
          downPaymentPercentage: 0.05,
          downPayment: null,
          monthlyPayment: 0,
          mortageRate: 0.05,
        },
        {
          amortization: 30,
          downPaymentPercentage: 0.2,
          downPayment: null,
          monthlyPayment: 0,
          mortageRate: 0.05,
        }
      ],
    }
  },
  mounted() {
    // this.calculate();
  },
  methods: {
    calculate() {
      const data = [];
      const n = Math.max(this.options[0].amortization, this.options[1].amortization) * NUMBER_OF_MONTHS;

      for (let optionIndex = 0; optionIndex < this.options.length; optionIndex++) {
        data.push([]);
        const option = this.options[optionIndex];
        const amortizationInMonths = option.amortization * NUMBER_OF_MONTHS;

        for (let i = 0; i < n; i++) {
          const previousIndex = i - 1;
          const previousTotalValue = data[optionIndex][previousIndex] ? data[optionIndex][previousIndex].futureValue : 0;
          const previousTotalInterests = data[optionIndex][previousIndex] ? data[optionIndex][previousIndex].totalInterests : 0;
          data[optionIndex].push({
            index: i + 1,
            monthlyPayment: i <= amortizationInMonths ? this.getMonthtlyMortagePayment(optionIndex) : 0,
            monthlyContribution: this.getMonthlyContribution(i, optionIndex),
            totalInterests: this.getTotalInterests(i, optionIndex, previousTotalInterests, previousTotalValue),
            futureValue: this.getTotalValue(i, optionIndex, previousTotalValue),
          });
        }
      }

      this.data = data;
    },
    formatMoney(number) {
      return new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(number);
    },

    /**
     * Mortage:
     */
    getMortageAmount(optionIndex) {
      return this.price - this.options[optionIndex].downPaymentPercentage * this.price;
    },
    getMortageProtectionInsurance(optionIndex) {
      if (this.options[optionIndex].downPaymentPercentage < 0.2) {
        return 0.05 * (this.price - this.options[optionIndex].downPaymentPercentage * this.price);
      }
      return 0;
    },
    getTotalMortageAmount(optionIndex) {
      const insurance = this.getMortageProtectionInsurance(optionIndex);
      const mortage = this.getMortageAmount(optionIndex);
      return mortage + insurance; 
    },
    getMonthtlyMortagePayment(optionIndex) {
      const amortization = this.options[optionIndex].amortization;
      const monthlyMortageRate = this.options[optionIndex].mortageRate / NUMBER_OF_MONTHS;
      const mortageWithInsurance = this.getTotalMortageAmount(optionIndex);
      return mortageWithInsurance * monthlyMortageRate / (1 - Math.pow(1 + monthlyMortageRate, -1 * amortization * NUMBER_OF_MONTHS));
    },
    getTotalPayments(optionIndex) {
      console.log(this.options);
      return this.options[optionIndex].amortization * NUMBER_OF_MONTHS * this.getMonthtlyMortagePayment(optionIndex);
    },

    /**
     * Investment:
     */
    getMonthlyContribution(monthIndex, optionIndex) {
      const currentOption = this.options[optionIndex];
      const currentOptionAmortizationInMonths = currentOption.amortization * NUMBER_OF_MONTHS;
      const currentOptionMonthlyMortagePayment = this.getMonthtlyMortagePayment(optionIndex);
      const currentOptionMonthlyPayment = monthIndex <= currentOptionAmortizationInMonths ? currentOptionMonthlyMortagePayment : 0;
      const currentOptionMortage = this.getMortageAmount(optionIndex);

      const otherOptionIndex = optionIndex === 1 ? 0 : 1;
      const otherOption = this.options[otherOptionIndex];
      const otherOptionAmortizationInMonths = otherOption.amortization * NUMBER_OF_MONTHS;
      const otherOptionMonthlyMortagePayment = this.getMonthtlyMortagePayment(otherOptionIndex);
      const otherOptionMonthlyPayment = monthIndex <= otherOptionAmortizationInMonths ? otherOptionMonthlyMortagePayment : 0;
      const otherOptionMortage = this.getMortageAmount(otherOptionIndex);

      let monthlyContribution = 0;

      if (otherOptionMonthlyPayment > currentOptionMonthlyPayment) {
        monthlyContribution += otherOptionMonthlyPayment - currentOptionMonthlyPayment;
      }

      if (monthIndex === 0) {
        monthlyContribution += Math.max(currentOptionMortage - otherOptionMortage, 0);
      }

      return monthlyContribution;
    },
    getMonthlyInterests(p, r) {
      // return p * Math.pow(1 + r, (i - k) / NUMBER_OF_MONTHS) - p;
      return p * Math.pow(1 + r, 1 / NUMBER_OF_MONTHS) - p;
    },
    getTotalInterests(monthIndex, optionIndex, previousTotalInterests, previousTotalValue) {
      let totalInterests = previousTotalInterests;
      if (monthIndex > 0) {
        const monthlyContribution = this.getMonthlyContribution(monthIndex - 1, optionIndex);
        const interests = this.getMonthlyInterests(monthlyContribution + previousTotalValue, this.averageAnnualReturnRate);
        totalInterests += interests;
      }
      return totalInterests;
    },
    getTotalValue(monthIndex, optionIndex, previousTotalValue) {
      let futureValue = previousTotalValue;
      if (monthIndex > 0) {
        const monthlyContribution = this.getMonthlyContribution(monthIndex - 1, optionIndex);
        const interests = this.getMonthlyInterests(monthlyContribution + futureValue, this.averageAnnualReturnRate);
        futureValue += monthlyContribution + interests;
      }
      return futureValue;
    },
  }
}
</script>

<style>
html {
  font-size: 14px;
}

.box {
  border: 2px dashed black;
  padding: 1rem;
}

tr > th:not(:first-child) {
  min-width: 150px;
}
</style>
