import { mount } from '@vue/test-utils'
import App from './../src/App.vue';

describe('App.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(App, {
      mocks: {
        $t: () => {}
      }
    });
    wrapper.setData({
      price: 500000,
      options: [
        {
          downPaymentPercentage: 0.05,
        },
        {
          downPaymentPercentage: 0.2,
        }
      ],
    });
  });

  it('has data', () => {
    expect(typeof App.data).toBe('function');
  });

  it("should get the mortage cost with a 5% down payment", () => {
    expect(wrapper.vm.getMortageAmount(0)).toBe(475000);
  });

  it("should get the insurance cost with a 5% down payment", () => {
    expect(wrapper.vm.getMortageProtectionInsurance(0)).toBe(23750);
  });

  it("should get the mortage & insurance costs with a 5% down payment", () => {
    expect(wrapper.vm.getTotalMortageAmount(0)).toBe(498750);
  });

  it("should get the mortage cost with a 20% down payment", () => {
    expect(wrapper.vm.getMortageAmount(1)).toBe(400000);
  });

  it("should get the insurance cost with a 20% down payment", () => {
    expect(wrapper.vm.getMortageProtectionInsurance(1)).toBe(0);
  });

  it("should get the mortage & insurance costs with a 20% down payment", () => {
    expect(wrapper.vm.getTotalMortageAmount(1)).toBe(400000);
  });
});
