import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import { placeOrder } from "./apiService";
import { Notyf } from "notyf";
import "notyf/notyf.min.css";

const notyf = new Notyf({
  position: {
    x: "right",
    y: "bottom",
  },
});

export async function initStripe() {
  const stripe = await loadStripe(
    "pk_test_51Jj6D7SCOKFf3DppUOSLvijXt9dgBEffnd3FHU3HfMSLeFVW1wqucJbSbnfgkajQs11aJM82U3Dw6NxQOaJ4aGLe00VEN4XHS3"
  );

  let card = null;

  function mountWidget() {
    let style = {
      base: {
        color: "#32325d",
        fontFamily: "'Helvetica Neue', Helvetica, sans-serif",
        fontSmoothing: "antialiased",
        fontSize: "16px",
        "::placeholder": {
          color: "#aab7c4",
        },
      },
      invalid: {
        color: "#fa755a",
        iconColor: "#fa755a",
      },
    };
    const elements = stripe.elements();
    card = elements.create("card", { style, hidePostalCode: true });
    card.mount("#card-element");
  }

  let paymentType = document.querySelector("#paymentType");

  if (!paymentType) {
    return;
  }

  paymentType.addEventListener("change", (e) => {
    if (e.target.value === "card") {
      mountWidget();
    } else {
      card.destroy();
    }
  });

  // payment form
  let paymentForm = document.querySelector("#payment-form");
  if (paymentForm) {
    paymentForm.addEventListener("submit", (e) => {
      // prevent default submit of form
      e.preventDefault();

      let formData = new FormData(paymentForm);

      /*
    {
      phone: 236217639213,
      address: ncvsljvsjdbnsdj
    }
    */

      let formObject = {};
      for (let [key, value] of formData.entries()) {
        formObject[key] = value;
      }

      // console.log(formObject);
      // return;
      // Cod Payment
      if (!card) {
        placeOrder(formObject);
        return;
      }

      // Card Payment
      else {
        //Verify Card
        stripe
          .createToken(card)
          .then((result) => {
            formObject.stripeToken = result.token.id;
            placeOrder(formObject);
          })
          .catch((err) => {
            console.log(err);
          });
      }
    });
  }
}
