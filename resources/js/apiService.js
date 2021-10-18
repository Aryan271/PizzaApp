import axios from "axios";
import { Notyf } from "notyf";
import "notyf/notyf.min.css";

const notyf = new Notyf({
  position: {
    x: "right",
    y: "bottom",
  },
});

export function placeOrder(formObject) {
  axios
    .post("/orders", formObject)
    .then((res) => {
      notyf.success(res.data.message);

      setTimeout(() => {
        window.location.href = "/customer/my_orders";
      }, 500);
    })
    .catch((err) => {
      notyf.error("Something Went Wrong!");
      console.log(err);
    });
}
