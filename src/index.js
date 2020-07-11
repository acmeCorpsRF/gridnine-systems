import './style.scss';

const parentElement = document.getElementById('content');
const flightList = document.createElement('ul');
const monthsArray = ['Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня', 'Июля', 'Августа', 'Сентября', 'Ноября', 'Декабря'];


function timeToFly(duration) {
    const hours = ((duration / 60).toString()).split('.')[0];
    const minutes = (duration % 60);
    return `${hours} ч ${minutes} мин`;
}

function createDate(getDate, string) {
    const time = getDate.substring(getDate.indexOf('T') + 1, getDate.indexOf('T') + 6);
    const date = getDate.substring(8, 10);
    let month;
    monthsArray.forEach((monthsArrayItem, index) => {
        if (index + 1 === Number(getDate.substring(5, 7))) {
            month = monthsArrayItem.toLowerCase();
        }
    });
    if (string === 'departure') {
        return `${time} <span class="small">${date} ${month}</span>`;
    } else {
        return `<span class="small">${date} ${month}</span> ${time}`;
    }
}

function createItem(flightItem) {
    const flight = flightItem.flight;
    const duration = timeToFly(flight.legs[0].duration);
    const departure = createDate(flight.legs[0].segments[0].departureDate, 'departure');
    const arrival = createDate(flight.legs[0].segments[flight.legs[0].segments.length - 1].arrivalDate, 'arrival');
    return (
        `<li class="flight-list__item">
            <div class="flight-list__item-block">
                <div class="flight-list__item-header">
                    <span class="flight-list__item-header-carrier">${flight.carrier.caption}</span>
                    <div class="flight-list__item-price">
                        <span class="flight-list__item-price-total">${flight.price.total.amount} ${flight.price.total.currency}</span>
                        <span class="flight-list__item-price-subtitle">Стоимость для одного взрослого пассажира</span>
                    </div>
                </div>
                <div class="flight-list__item-info">
                    <div class="flight-list__item-flight-points">
                        <span class="flight-list__item-departure">${flight.legs[0].segments[0].departureCity.caption}, ${flight.legs[0].segments[0].departureAirport.caption} (${flight.legs[0].segments[0].departureAirport.uid})</span>
                        <span class="flight-list__item-arrow">&#8594;</span>
                        <span class="flight-list__item-destination">${flight.legs[0].segments[flight.legs[0].segments.length - 1].arrivalCity.caption}, ${flight.legs[0].segments[flight.legs[0].segments.length - 1].arrivalAirport.caption} (${flight.legs[0].segments[flight.legs[0].segments.length - 1].arrivalAirport.uid})</span>
                    </div>
                    <div class="flight-list__item-flight-dates">
                        <span class="flight-list__item-departure-date">${departure}</span>
                        <span class="flight-list__item-travel-time"><span class="flight-list__item-clock">&#8986;</span>${duration}</span>
                        <span class="flight-list__item-arrival-date">${arrival}</span>
                    </div>
                    <span class="flight-list__item-carrier">Рейс выполняет: ${flight.carrier.caption}</span>
                </div>
                <a class="flight-list__item-button" href="/">Выбрать</a>
            </div>
        </li>`
    )
}

function createFlightList(flights) {
    flightList.classList.add('flight-list');
    flightList.innerHTML = '';
    let flightListItems = '';
    flights.forEach(flightItem => {
        flightListItems += createItem(flightItem);
        flightList.innerHTML = flightListItems;
    });
    parentElement.append(flightList);
}

function dataRequest() {
    fetch('api/flights.json')
        .then(response => response.json())
        .then(response => createFlightList(response.result.flights))
}

let searchForm = (e) => {
    const ascendingPriceBtn = document.getElementById('ascending-price').checked;
    const descendingPriceBtn = document.getElementById('descending-price').checked;
    const travelTimeBtn = document.getElementById('by-travel-time').checked;
    const checkBoxFilter = document.getElementById('filter').checked;
    const minPrice = Number(document.getElementById('min-price').value);
    const maxPrice = Number(document.getElementById('max-price').value);

    fetch('api/flights.json')
        .then(response => response.json())
        .then(response => {
            let flights;
            switch (true) {
                case ascendingPriceBtn:
                    flights = response.result.flights.sort((a, b) => a.flight.price.total.amount > b.flight.price.total.amount ? 1 : -1);
                    break;
                case descendingPriceBtn:
                    flights = response.result.flights.sort((a, b) => a.flight.price.total.amount < b.flight.price.total.amount ? 1 : -1);
                    break;
                case travelTimeBtn:
                    flights = response.result.flights.sort((a, b) => a.flight.legs[0].duration > b.flight.legs[0].duration ? 1 : -1);
                    break;
                default:
                    flights = response.result.flights;
            }

            flights = flights.filter(item => {
                return item.flight.price.total.amount < maxPrice && item.flight.price.total.amount > minPrice;
            });

            if (checkBoxFilter) {
                let nonStopFlights = flights.filter(item => {
                    return item.flight.legs[0].segments.length < 2
                });
                createFlightList(nonStopFlights);
            } else {
                createFlightList(flights);
            }


        })
};

dataRequest();

const form = document.querySelector('form');
form.addEventListener('change', searchForm.bind(this));