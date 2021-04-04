function validateForm() {
    var x = document.forms["encryptor"]["enc_data"].value;
    console.log(x)
    if (x == "") {
      alert("Name must be filled out");
      return false;
    }
  }