/* eslint-env browser */
/* global skel, jQuery */

(function($) {
  skel
    .breakpoints({
      desktop: `(min-width: 737px)`,
      tablet: `(min-width: 737px) and (max-width: 1200px)`,
      mobile: `(max-width: 736px)`
    })
    .viewport({
      breakpoints: {
        tablet: {
          width: 1080
        }
      }
    })

  $(function() {

    var	$window = $(window),
      $body = $(`body`)

    // Disable animations/transitions until the page has loaded.
    $body.addClass(`is-loading`)

    $window.on(`load`, function() {
      $body.removeClass(`is-loading`)
    })

    // Fix: Placeholder polyfill.
    $(`form`).placeholder()

    // CSS polyfills (IE<9).
    if (skel.vars.IEVersion < 9)
      $(`:last-child`).addClass(`last-child`)

    // Prioritize "important" elements on mobile.
    skel.on(`+mobile -mobile`, function() {
      $.prioritize(
        `.important\\28 mobile\\29`,
        skel.breakpoint(`mobile`).active
      )
    })

    // Dropdowns.
    $(`#nav > ul`).dropotron({
      mode: `fade`,
      noOpenerFade: true,
      alignment: `center`,
      detach: false
    })

    // Off-Canvas Navigation.

    // Title Bar.
    $(
      `<div id="titleBar">` +
      `<a href="#navPanel" class="toggle"></a>` +
      `<span class="title">` + $(`#logo`).html() + `</span>` +
     `</div>`
    )
      .appendTo($body)

    // Navigation Panel.
    $(
      `<div id="navPanel">` +
      `<nav>` +
       $(`#nav`).navList() +
      `</nav>` +
     `</div>`
    )
      .appendTo($body)
      .panel({
        delay: 500,
        hideOnClick: true,
        hideOnSwipe: true,
        resetScroll: true,
        resetForms: true,
        side: `left`,
        target: $body,
        visibleClass: `navPanel-visible`
      })

    // Fix: Remove navPanel transitions on WP<10 (poor/buggy performance).
    if (skel.vars.os == `wp` && skel.vars.osVersion < 10)
      $(`#titleBar, #navPanel, #page-wrapper`)
        .css(`transition`, `none`)


    // contact us form sending email
    var $form = $(`#contact-us-form`)
    $form.submit(function onContactFormSubmit(event) {

      event.preventDefault()

      var $this = $(this)
      var contactFormData = {
        name: $this.find(`#contact-name`).val(),
        email: $this.find(`#contact-email`).val(),
        message: $this.find(`#contact-message`).val()
      }

      $(`#contact-us-form`).find(`input, textarea`).attr(`disabled`, `disabled`)

      $.ajax({
        url: `/api/email`,
        type: `POST`,
        data: contactFormData,
        dataType: `json`,
      }).done(function(data) {

        $(`#contact-us-form`).find(`input, textarea`).attr(`disabled`, false)

        if (data.success) {
          alert(`Thank you for contacting us. We will get back to you shortly!`)
          $(`#contact-us-form`).find(`input[type=text],textarea`).each(function(index, elem) {
            $(elem).val(``)
          })
        } else {
          alert(data.error)
        }
      })

      return false
    })

  })

})(jQuery)
