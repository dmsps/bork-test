$(function() {
  let phoneValid = false,
    passwordValid = false;

  $("#loginPhone").mask("0 (000) 000-00-00", {
    onChange: function(cep, event, currentField, options) {
      phoneValid = false;
      handleTouch(currentField);
      currentField.parent(".field").removeClass("accept");
    },
    onComplete: function(cep, event, currentField, options) {
      phoneValid = true;
      disableSubmit();
      currentField.parent(".field").addClass("accept");
    }
  });

  $("#loginPassword").on("input", function(obj) {
    obj.target.value.length >= 6
      ? (passwordValid = true)
      : (passwordValid = false);
    disableSubmit();
    handleTouch($(this));
  });

  function disableSubmit() {
    let submitButton = $("#submitLoginForm");

    if (phoneValid && passwordValid) {
      submitButton.removeClass("disabled");
    } else {
      submitButton.addClass("disabled");
    }
  }

  function handleTouch(object) {
    object.val().length > 0
      ? object.addClass("touched")
      : object.removeClass("touched");
  }

  MicroModal.init();
  disableSubmit();
  handleTouch($("#loginPhone"));
  handleTouch($("#loginPassword"));
});
