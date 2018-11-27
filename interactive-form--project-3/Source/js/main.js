/**
 * The form's javascript file.
 * 
 * The rest is the interaction for the form. 
 */


(function() {
    "use strict";

    // implementation of requirement (R2) "Job Role Other"
    function EnableJobRoleInteraction() {
        const $yourJobRoleInput = $("#your-job-role");
        const $jobTitleSelect = $("#title");

        function ShowOrHideYourJobRoleDependingOnSelection() {
            $yourJobRoleInput.toggle($jobTitleSelect.val() === "other");
        }

        // Connect & Initialize interaction
        $jobTitleSelect.on("change", ShowOrHideYourJobRoleDependingOnSelection);
        ShowOrHideYourJobRoleDependingOnSelection();
    }

    // implementation of requirement (R3+R4) "Dropboxes and placeholders"
    function EnableTShirtDesignsAndColorsInteraction() {
        const $designSelect = $("#design");
        const $colorSelect  = $("#color");

        // Add a placeholder option
        const $placeholderOption = $('<option>Please select a T-shirt theme</option>');
        $colorSelect.prepend($placeholderOption);

        function MakeColorsVisibleByDesign(design) {
            let options = $colorSelect.children();

            for (let i = 0; i < options.length; i++ ) {
                let $option = $(options[i]);

                $option.toggle($option.data("belongstoshirt") === design);
            }

            $placeholderOption.toggle(design === "Select Theme");

            /* We always select the first visible option when the theme is changed.
               As far as we know there should always be at least one.
             */
            $colorSelect.val($colorSelect.find("option:visible")[0].value);
        }

        // Connect & initialize interaction
        $designSelect.on("change", () => { MakeColorsVisibleByDesign($designSelect.val()); });
        MakeColorsVisibleByDesign($designSelect.val());
    }

    // implementation of requirement (R11) "Dropboxes and placeholders"
    // For exceeding expectations we need to do some things differently.
    function EnableTShirtDesignsAndColorsInteraction_ExceedingExpectations() {
        const $designSelect = $("#design");
        const $colorSelect  = $("#color");
        const $colorSelectLabel = $("label[for='color']");

        // Add a placeholder option
        const $placeholderOption = $('<option>Please select a T-shirt theme</option>');
        $colorSelect.prepend($placeholderOption);

        function MakeColorsVisibleByDesign(design) {
            let options = $colorSelect.children();

            /* Toggle visibility and select the first entry when selecting
               an option that is visible. */
            if (design === "Select Theme") { 
                $colorSelect.hide(); 
                $colorSelectLabel.hide();
            }

            for (let i = 0; i < options.length; i++ ) {
                let $option = $(options[i]);

                $option.toggle($option.data("belongstoshirt") === design);
            }

            if (design !== "Select Theme") {  
                $colorSelect.show(); 
                $colorSelectLabel.show();
                $colorSelect.val($colorSelect.find("option:visible")[0].value);
            }
        }

        // Connect & initialize interaction
        $designSelect.on("change", () => { MakeColorsVisibleByDesign($designSelect.val()); });
        MakeColorsVisibleByDesign($designSelect.val());
    }


    // implementation of requirement (R5) "Activities and timeslots"
    function EnableActivitySelectionAndTimeslots() {
        const $activityFieldset = $(".activities");
        const $activityCheckboxes = $('.activities input[type="checkbox"]');

        // Collects information about all the used timeslots.
        function UsedTimeslots() {
            let result = [];

            for (let i = 0; i < $activityCheckboxes.length; i++ ) {
                let $checkbox = $($activityCheckboxes[i]);
                let checkboxIsChecked = $checkbox.prop("checked");
                let timeslot = $checkbox.data("timeslot");
            
                if ( checkboxIsChecked ) {
                    result.push(timeslot);
                }
            }

            return result;
        }        

        function DisableActivitiesOnTimeslotsThatAreNotChecked(event) {
            // We want this handler to just run once every checkbox click/change.
            if ( event !== undefined ) event.stopPropagation();

            let usedTimeslots = UsedTimeslots();

            for (let i = 0; i < $activityCheckboxes.length; i++ ) {
                let $checkbox = $($activityCheckboxes[i]);
                let $label    = $checkbox.closest("label");

                let checkboxIsChecked = $checkbox.prop("checked");
                let timeslot = $checkbox.data("timeslot");
                
                let shouldBeDisabled = usedTimeslots.indexOf(timeslot) > -1 && !checkboxIsChecked;

                $checkbox.prop("disabled", shouldBeDisabled);
                $label.toggleClass("label--inactive", shouldBeDisabled);
            }
        }

        $activityFieldset.on("click", DisableActivitiesOnTimeslotsThatAreNotChecked);
        DisableActivitiesOnTimeslotsThatAreNotChecked();
    }

    // implementation of requirement (R6) "Activities and their costs"
    function EnableActivityCostCalculation() {
        const $activityFieldset = $(".activities");
        const $activityCheckboxes = $('.activities input[type="checkbox"]');

        // total cost html "control"
        const $totalCostControl = $(`
        <div class="totalCost">
            <span class="totalCost__label">Total:</span>
            <span class="totalCost__cost">$0</span>
        </div>
        `);
        $activityFieldset.append($totalCostControl);

        function TotalCost() {
            let result = 0;

            for (let i = 0; i < $activityCheckboxes.length; i++ ) {
                let $checkbox = $($activityCheckboxes[i]);
                let checkboxIsChecked = $checkbox.prop("checked");
                let cost = parseInt($checkbox.data("cost"), 10);
                
                if ( checkboxIsChecked ) {
                    result += cost;
                }
            }

            return result;
        }

        function UpdateTotalCost() {
            $totalCostControl.find(".totalCost__cost").text("$" + TotalCost().toString());
        }

        $activityFieldset.on("click", UpdateTotalCost);
        UpdateTotalCost();
    }

    // implementation of requirement (R7) "Show and hide payment sections"
    function EnablePaymentSectionDisplay() {
        const $paymentSelect = $("#payment");
        const options = $paymentSelect.children();

        function HideAll() {
            for (let i = 0; i < options.length; i++) {
                $("." + $(options[i]).data("connectedtocssclass")).hide();
            }
        }

        function ShowSelectedPaymentSection() {
            HideAll();

            let selectedOption = $paymentSelect.find("option:selected");
            let cssClass = "." + $(selectedOption).data("connectedtocssclass");

            $(cssClass).show();
        }

        $paymentSelect.on("change", ShowSelectedPaymentSection);
        ShowSelectedPaymentSection();
    }

    // implementation of requirement (R8) "Form Validation"
    function EnableFormValidation() {
        const $form = $("form");
        // all validation rules that shall be applied
        const rules = [];
        // all validation controls, the controls showing the error messages
        const validationControls = [];
        // all selectors for controls that shall be validated
        const validatedControlSelectors = [];

        /* When used with javascript we modify the form to not do 
           HTML 5 validation so we can meet the requirements. 
           Still, when Js is disabled, why not use it? */
        $form.attr("novalidate", "novalidate");

        /* OnlyDigits verifies that there are only numerical
           characters within the text passed in. We need that 
           for the validation of the credit card.
        */
        function OnlyDigits(text) {
            var validCharacters = "1234567890";

            for( let i = 0; i < text.length; i++ ) {
                if ( validCharacters.indexOf(text[i])===-1 ) {
                    return false;
                }
            } 

            return true;
        }

        function RegisterValidationControlFor(selector, controlId, $control) {
            const newControlInfo = { 
                for: selector, 
                name: controlId,
                $control: $control
            }; 

            if ( $control === undefined ) {
                newControlInfo.$control = $(controlId);
            }

            validationControls.push(newControlInfo);
            validatedControlSelectors.push(selector);
        }

        function AppendValidationControlFor(selector) {
            let controlId = '#validationControl_' + (validationControls.length+1).toString();
            let $control = $('<div id="' + controlId + '" class="validationControl" data-validatorFor="' + selector + '"></div>');
            $control.insertAfter($(selector));

            RegisterValidationControlFor(selector, controlId, $control);
        }

        function ShowValidationMessage(forSelector, message) {
            // We convert our messages to HTML, encode them, 
            // then we can savely replace line feeds with <br>'s.
            let messageHtml = $('<div/>').text(message).html().replace(/\n/g, "<br/>");

            for (let i = 0; i < validationControls.length; i++) {
                if ( validationControls[i].for === forSelector ) {
                    validationControls[i].$control.html(messageHtml);
                }
            }
        }

        function IsFormValid() {
            $(".validationControl").html("");
            
            let result = true;

            for (let i = 0; i < rules.length; i++) {
                let evaluatedRule = rules[i]();

                if (evaluatedRule.for !== undefined) {
                    ShowValidationMessage(evaluatedRule.for, evaluatedRule.message);
                    result = false;
                }
            }

            if ( result === false ) {
                $("#registerButtonValidationControl").text("Sorry, there are still warnings. Please correct your data before submitting.");
                window.setTimeout(() => { $("#registerButtonValidationControl").text(""); }, 2000);
            }

            return result;
        }

        /* Partial validation method. Does exactly the same validation 
           but only shows the message for the selector that is specified
           by the parameter. 
           With this we can change all validations to live validations and
           still keep the UI clean from validation happening before the 
           user has entered any text into the UI.
        */
        function PartialValidationFor(selector) {
            console.log("executing partial validation for " + selector);
            let $validator = $(".validationControl[data-validatorFor='" + selector + "']");
            $validator.html(""); 
            
            let result = true;

            for (let i = 0; i < rules.length; i++) {
                let evaluatedRule = rules[i]();

                if (evaluatedRule.for === selector) {
                    ShowValidationMessage(evaluatedRule.for, evaluatedRule.message);
                }
            }
        }

        /* Attach event handlers for the validation: We need an event handler that
           fires on blur and on changes within a field and executes the partial 
           validation rules.
           The validator needs to be attached to every field that shall be instantly
           validated while typing.
         */
        function AttachInstantValidationToDom() {
            function AttachValidation(selector, validatedControlSelector) {
                $(selector)
                    .on("blur",   function(event) { PartialValidationFor(validatedControlSelector); event.stopPropagation(); })
                    .on("change", function(event) { PartialValidationFor(validatedControlSelector); event.stopPropagation(); })
                    .on("keyup",  function(event) { PartialValidationFor(validatedControlSelector); event.stopPropagation(); })
                    .on("click",  function(event) { PartialValidationFor(validatedControlSelector); event.stopPropagation(); });
            };

            for (let i = 0; i < validatedControlSelectors.length; i++) {
                if ( validatedControlSelectors[i] === ".activities" ) continue;
                if ( validatedControlSelectors[i] === ".credit-card-row1" ) continue; // its a virtual selector

                AttachValidation(validatedControlSelectors[i], validatedControlSelectors[i]);
            }

            AttachValidation("#cc-num", ".credit-card-row1");
            AttachValidation("#zip", ".credit-card-row1");
            AttachValidation("#cvv", ".credit-card-row1");
        }

        AppendValidationControlFor("#name");
        AppendValidationControlFor("#email");
        RegisterValidationControlFor(".activities", "#registerActivitiesValidationControl");

        // .credit-card-row1 is virtual, just an identifier
        RegisterValidationControlFor(".credit-card-row1", "#cardnumber-zipcode-cvv-validation");
        AppendValidationControlFor("#payment");

        // R8.1 Name field isn’t blank
        rules.push(() => {
            if ( $("#name").val() === "" ) { return { for: "#name", message: "The name field shoudn't be blank." }; }
            return {};
        });
        // R8.2 Email-field isn't blank
        rules.push(() => {
            if ( $("#email").val() === "" ) {
                return { for: "#email", message: "The e-mail field is required. Please enter your email address." };
            }

            const emailRegEx = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
            if ( !emailRegEx.test($("#email").val()) ) {
                return { for: "#email", message: "The e-mail field does not contain a valid email address." };
            }
            return {};
        });
        // R8.3 there should be an activity that is checked; at least one
        rules.push(() => {
            if ( $(".activities input:checked").length == 0 ) {
                return { for: ".activities", message: "There should be at least one activity that is selected." };
            } 
            return {};
        });
        // R8.4 If "Credit Card" is the selected payment option, the three fields accept only numbers: a 13 to 16-digit credit card number, a 5-digit zip code, and 3-number CVV value
        rules.push(() => {
            let message = ""; 

            if ( $("#payment").val() !== "credit card" ) {
                return {};
            }

            if ( $("#cc-num").val().length < 13 || 
                 $("#cc-num").val().length > 16 ) {
                message += "The credit card number should be between 13 and 16 numbers long.\n";
            }

            if ( !OnlyDigits($("#cc-num").val()) ) {
                message += "You have entered non-numerical characters into the credit card number.\n";
            }

            if ( $("#zip").val().length !== 5 ) {
                message += "The zip code should be 5 digits long.\n";
            }
            if ( !OnlyDigits($("#zip").val() )) {
                message += "The zip code should contain only numerical characters.\n";
            }

            if ( $("#cvv").val().length !== 3 ) {
                message += "The cvv should be 3 digits long.\n";
            }

            if ( !OnlyDigits($("#cvv").val()) ) {
                message += "You have entered non-numerical characters into the cvv.\n";
            }
            
            if ( message !== "" ) {
                return { for: ".credit-card-row1", message: message.trim() };
            }

            // Todo: We should split the error message when the screen is very small and
            // the layout gets rearranged. It works this way, its ok, but it would be better still.

            return {};
        });

        rules.push(() => {
            if ( $("#payment").val() === "select_method" ) {
                return { for: "#payment", message: "Please select a payment method..." };
            }
            return {};
        });


        // When the form is submitted, then we first want to check if all rules apply.
        $form.on("submit", (event) => {
            if (!IsFormValid()) {
                event.preventDefault();
            }
        });
        // Instant validation = on
        AttachInstantValidationToDom();
    }

    EnableJobRoleInteraction();
    // EnableTShirtDesignsAndColorsInteraction();
    EnableTShirtDesignsAndColorsInteraction_ExceedingExpectations();
    EnableActivitySelectionAndTimeslots();
    EnableActivityCostCalculation();
    EnablePaymentSectionDisplay();
    EnableFormValidation();
})();