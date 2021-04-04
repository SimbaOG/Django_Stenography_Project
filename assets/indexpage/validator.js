function validateForm() {
    var x = document.forms["encryptor"]["enc_data"].value;
    if (x == "") {
      alert("Name must be filled out");
      return false;
    }
  }