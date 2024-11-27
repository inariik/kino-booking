$(document).ready(function() {
  function getDates() {
    let today = new Date();
    let datesArray = [];
    for (let i = -7; i <= 7; i++) {
      let date = new Date(today);
      date.setDate(today.getDate() + i);
      datesArray.push(date.toISOString().slice(0, 10));
    }
    return datesArray;
  }

  function refreshDatePicker() {
    let availableDates = getDates();
    $('#date-picker').empty();
    $.each(availableDates, function(index, date) {
      let button = $(`<button class="date-button">${date}</button>`);
      button.click(function() {
        $('.date-button').removeClass('selected');
        $(this).addClass('selected');
        let selectedDate = $(this).text();
        $('#session-picker').empty();

        let sessions = [];
        for (let i = 10; i <= 20; i += 2) {
          sessions.push(`${i}:00`);
        }

        let now = new Date();
        let selectedDateObj = new Date(selectedDate);

        $.each(sessions, function(index, session) {
          let sessionTime = new Date(selectedDateObj);
          sessionTime.setHours(parseInt(session.split(':')[0]), parseInt(session.split(':')[1]));

          let isPast = sessionTime < now;
          let button = $(`<button class="session-button ${isPast ? 'past-session' : ''}">${session}</button>`);
          $('#session-picker').append(button);
        });

        $('#session-picker').on('click', '.session-button', function() {
          $('.session-button').removeClass('selected');
          $(this).addClass('selected');
          let selectedDate = $('.date-button.selected').text();
          let selectedSession = $(this).text();
          let sessionID = `${selectedDate}_${selectedSession}`;
          $('#seat-grid').empty();
          let rows = 5;
          let cols = 10;
          let seatCount = 1;
          let seatGrid = $('#seat-grid');
          let isPastSession = $(this).hasClass('past-session');
      
          for (let i = 0; i < rows; i++) {
            let row = $('<tr>');
            for (let j = 0; j < cols; j++) {
              let seat = $('<td>').text(seatCount); // Убрал добавление класса seat здесь
              seatCount++;
              if (isPastSession) {
                seat.addClass('past-session'); // Добавляем класс past-session ВНУТРИ цикла
              }
              seat.addClass('seat'); //Добавляем класс seat здесь
              row.append(seat);
            }
            seatGrid.append(row);
          }
      
          loadBooking(sessionID);
      
          $('.seat').click(function() {
            if ($(this).hasClass('past-session')) return;
            $(this).toggleClass('booked');
            saveBooking(sessionID);
            updateBookingSummary(sessionID);
            $('#selected-session').text(`Выбрана дата: ${selectedDate}, время: ${selectedSession}`);
          });
        });
      });
      $('#date-picker').append(button);
    });
  }

  function saveBooking(sessionID) {
    let bookedSeats = $('.booked').map(function() {
      return $(this).text();
    }).get();
    let bookings = JSON.parse(localStorage.getItem('bookings') || '{}');
    bookings[sessionID] = bookedSeats;
    localStorage.setItem('bookings', JSON.stringify(bookings));
  }

  function loadBooking(sessionID) {
    let bookings = JSON.parse(localStorage.getItem('bookings') || '{}');
    if (bookings[sessionID]) {
      let seats = bookings[sessionID];
      $.each(seats, function(index, seat) {
        $('.seat:contains(' + seat + ')').addClass('booked');
      });
    }
  }

  function updateBookingSummary(sessionID) {
    let bookedCount = $('.booked').length;
    $('#booking-summary').text(`Забронировано мест для сеанса ${sessionID || "не выбран"}: ${bookedCount}`); // Обратные кавычки!
  }
  
  $('#reset-booking').click(function() {
    localStorage.removeItem('bookings');
    $('.booked').removeClass('booked');
    updateBookingSummary();
  });
  
  refreshDatePicker();
  setInterval(refreshDatePicker, 60000);
  });