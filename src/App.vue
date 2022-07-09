<template>
  <div>
    <div class="py-3" style="background-color: #f1f1f1; margin-bottom: 1.5rem;">
      <div class="container">
        <!-- H1 -->
        <div class="row mb-5">
          <div class="col">
            <h1 class="text-center">Planificateur financier de l'achat d'une maison</h1>
          </div>
        </div>

        <div class="row justify-content-center mb-n4">
          <div class="col-md-6 mb-4">
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
          <div class="col-md-6 mb-4">
            <div class="row mb-3">
              <div class="col">
                <div class="fs-4">Paramètres avancés</div>
              </div>
            </div>

            <div class="row mb-3">
              <div class="col">
                <label class="form-label fw-bold">Date de l'achat de la maison</label>
                <input class="form-control" type="date" :value="currentDate.toJSON().substring(0,10)" @input="currentDate = new Date($event.target.value)" />
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
                <label class="form-label fw-bold">Estimation du barème d'imposition</label>
                <input class="form-control" type="number" value="0.5331" disabled />
                <small>Le barème d'imposition le plus élevé est de 53,31%. Aussi, Les gains en capital sont imposables à 50%.</small>
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

    <div class="container">
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
                <table class="table">
                  <thead>
                    <tr>
                      <th scope="col">Date</th>
                      <th scope="col">Total des versements</th>
                      <th scope="col">Total des investissements</th>
                      <th scope="col">Total des intérêts</th>
                      <th scope="col">Impôts</th>
                      <th scope="col">Valeur totale du portefeuille</th>
                    </tr>
                  </thead>
                  <tbody>
                    <template v-for="(item, itemIndex) in option" :key="itemIndex">
                      <tr>
                        <th>
                          <a data-bs-toggle="collapse" :href="'#collapse-' + itemIndex" role="button" aria-expanded="false" :aria-controls="'collapse-' + itemIndex">
                            {{ item.year }}
                          </a>
                        </th>
                        <th class="text-danger">{{ formatMoney(item.totalPayment) }}$</th>
                        <th>{{ formatMoney(item.totalContribution) }}$</th>
                        <th class="text-success">{{ formatMoney(item.totalInterests) }}$</th>
                        <th></th>
                        <th>{{ formatMoney(item.totalValue) }}$</th>
                      </tr>
                      <template v-for="(childItem, childItemIndex) in item.childItems" :key="childItemIndex">
                        <tr :id="'collapse-' + itemIndex" class="child-row collapse">
                          <th>{{ childItem.date.toDateString() }}</th>
                          <th class="text-danger">{{ formatMoney(childItem.monthlyPayment) }}$</th>
                          <th>{{ formatMoney(childItem.monthlyContribution) }}$</th>
                          <th class="text-success">{{ formatMoney(childItem.monthlyInterests) }}$</th>
                          <th></th>
                          <th>{{ formatMoney(childItem.totalValue) }}$</th>
                        </tr>
                      </template>
                    </template>
                  </tbody>
                  <tfoot>
                    <tr>
                      <td></td>
                      <td class="fw-bold text-danger">{{ formatMoney(getTotalPayments(optionIndex)) }}$</td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td class="fw-bold text-success">
                        <span v-if="option[option.length - 1] && option[option.length - 1].totalValue">
                          {{ formatMoney(option[option.length - 1].totalValue) }}$
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

    <Footer></Footer>
  </div>
</template>

<script>
import Footer from "@/components/Footer.vue";

const MAXIMUM_TAX_RATE = 0.5331;
const NUMBER_OF_MONTHS = 12;

export default {
  name: 'App',
  components: {
    Footer
  },
  data() {
    return {
      averageAnnualReturnRate: 0.07,
      currentDate: new Date(),
      data: [],
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
  methods: {
    calculate() {
      const amortizationPeriod = Math.max(this.options[0].amortization, this.options[1].amortization);
      const data = [];
      for (let optionIndex = 0; optionIndex < this.options.length; optionIndex++) {
        data.push([]);
      }

      for (let optionIndex = 0; optionIndex < this.options.length; optionIndex++) {
        const option = this.options[optionIndex];
        const amortizationInMonths = option.amortization * NUMBER_OF_MONTHS;
        for (let yearIndex = 0; yearIndex < amortizationPeriod; yearIndex++) {
          for (let i = 0; i < NUMBER_OF_MONTHS; i++) {
            const index = i + (yearIndex * NUMBER_OF_MONTHS);
            const date = new Date(this.currentDate.getYear() + 1900, this.currentDate.getMonth() + index + 1, 1);

            const previousIndex = index - 1;
            const previousTotalContribution = data[optionIndex][previousIndex] ? data[optionIndex][previousIndex].totalContribution : 0;
            const previousTotalInterests = data[optionIndex][previousIndex] ? data[optionIndex][previousIndex].totalInterests : 0;
            const previousTotalPayment = data[optionIndex][previousIndex] ? data[optionIndex][previousIndex].totalPayment : 0;
            const previousTotalValue = data[optionIndex][previousIndex] ? data[optionIndex][previousIndex].totalValue : 0;

            const monthlyContribution = this.getMonthlyContribution(index, optionIndex);
            const monthlyInterests = this.getMonthlyInterests(previousTotalValue, this.averageAnnualReturnRate);
            const monthlyPayment = index < amortizationInMonths ? this.getMonthtlyMortagePayment(optionIndex) : 0;

            const totalInterests = monthlyInterests + previousTotalInterests;
            const totalPayment = previousTotalPayment + monthlyPayment;
            const totalValue = monthlyContribution + monthlyInterests + previousTotalValue;

            data[optionIndex].push({
              optionIndex: optionIndex,
              index: i + 1,
              year: date.getYear() + 1900,
              date: date,
              monthlyContribution: monthlyContribution,
              monthlyPayment: monthlyPayment,
              monthlyInterests: monthlyInterests,
              totalContribution: previousTotalContribution + monthlyContribution,
              totalInterests: totalInterests,
              totalPayment: totalPayment,
              totalValue: totalValue,
            });
          }
        }

        // Group items by year:
        this.data[optionIndex] = [];
        const childRows = data[optionIndex].reduce((r, a) => {
          r[a.year] = [...r[a.year] || [], a];
          return r;
        }, {});
        for (const property in childRows) {
          const childItems = childRows[property];
          const item = childItems[childItems.length - 1];
          item['childItems'] = childItems;
          this.data[optionIndex].push(item);
        }
      }
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
      const totalMortageAmount = this.getTotalMortageAmount(optionIndex);
      return (totalMortageAmount * monthlyMortageRate) / (1 - Math.pow(1 + monthlyMortageRate, - amortization * 12));
    },
    getTotalPayments(optionIndex) {
      return this.options[optionIndex].amortization * NUMBER_OF_MONTHS * this.getMonthtlyMortagePayment(optionIndex);
    },

    /**
     * Investment:
     */
    getMonthlyContribution(monthIndex, optionIndex) {
      const currentOption = this.options[optionIndex];
      const currentOptionAmortizationInMonths = currentOption.amortization * NUMBER_OF_MONTHS;
      const currentOptionMonthlyMortagePayment = this.getMonthtlyMortagePayment(optionIndex);
      const currentOptionMonthlyPayment = monthIndex < currentOptionAmortizationInMonths ? currentOptionMonthlyMortagePayment : 0;
      const currentOptionMortage = this.getMortageAmount(optionIndex);

      const otherOptionIndex = optionIndex === 1 ? 0 : 1;
      const otherOption = this.options[otherOptionIndex];
      const otherOptionAmortizationInMonths = otherOption.amortization * NUMBER_OF_MONTHS;
      const otherOptionMonthlyMortagePayment = this.getMonthtlyMortagePayment(otherOptionIndex);
      const otherOptionMonthlyPayment = monthIndex < otherOptionAmortizationInMonths ? otherOptionMonthlyMortagePayment : 0;
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
  }
}
</script>

<style>
html {
  font-size: 14px;
}

.box {
  border: 3px dashed black;
  padding: 3rem;
}

tr th {
  min-width: 150px;
}

tr.child-row {
  font-size: 12px;
}

tr.child-row th {
  background-color: #f1f1f1;
  border: 0;
  padding: 0.25rem 0.5rem;
}
</style>
