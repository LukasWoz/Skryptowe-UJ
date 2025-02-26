import json
from typing import Any, Text, Dict, List, Union
from datetime import datetime, timedelta
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet, AllSlotsReset
from rasa_sdk.forms import FormValidationAction
import logging

# Konfiguracja logowania
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)  # Ustawienie poziomu logowania na INFO

# Wczytanie konfiguracji z pliku JSON
with open("config.json", "r", encoding="utf-8") as config_file:
    config_data = json.load(config_file)

# Menu i godziny otwarcia
menu = config_data["menu"]
opening_hours = config_data["opening_hours"]
delivery_cost = config_data["delivery_cost"]
pickup_address = config_data["pickup_address"]
orders_file = "orders.json"  # Plik do przechowywania zamówień


def is_restaurant_open(now: datetime) -> bool:
    """Sprawdza, czy restauracja jest aktualnie otwarta."""
    day_name = now.strftime("%A")
    hours = opening_hours.get(day_name, {})
    open_time = hours.get("open", 0)
    close_time = hours.get("close", 0)
    current_hour = now.hour

    if open_time == 0 and close_time == 0:
        return False
    return open_time <= current_hour < close_time


def next_opening_time(now: datetime) -> str:
    """Znajduje najbliższy czas otwarcia restauracji."""
    for i in range(1, 8):  # Sprawdza następne 7 dni
        next_day = now + timedelta(days=i)
        day_name = next_day.strftime("%A")
        hours = opening_hours.get(day_name, {})
        open_time = hours.get("open", 0)

        if open_time > 0:
            next_opening = next_day.replace(hour=open_time, minute=0, second=0, microsecond=0)
            return next_opening.strftime("%Y-%m-%d %H:%M")
    return "Restauracja jest tymczasowo nieczynna."


def save_order_to_file(order_details: Dict):
    """Zapisuje szczegóły zamówienia do pliku JSON."""
    try:
        with open(orders_file, "r", encoding="utf-8") as f:
            orders = json.load(f)
    except FileNotFoundError:
        orders = []

    orders.append(order_details)

    with open(orders_file, "w", encoding="utf-8") as f:
        json.dump(orders, f, indent=4, ensure_ascii=False)


class ValidateOrderForm(FormValidationAction):
    def name(self) -> Text:
        return "validate_order_form"

    async def required_slots(
        self,
        slots_mapped_in_domain: List[Text],
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Text]:
        """
        Dynamicznie dołącz slot address do required_slots,
        tylko jeśli user wybrał 'delivery'.
        """
        required = ["item", "delivery_preference"]

        delivery_preference = tracker.get_slot("delivery_preference")
        if delivery_preference == "delivery":
            required.append("address")

        return required

    def slot_mappings(self) -> Dict[Text, Union[Dict, List[Dict]]]:
        """
        Kluczowa różnica: 
        - Nie nadpisujemy slot mappingu 'address' -> from_entity(entity="address"), 
          skoro w domain.yml mamy 'from_text'.
        - Wystarczy from_entity dla 'item' i 'delivery_preference', 
          bo te chcesz rozpoznać jako encje.
        """
        return {
            "item": [
                self.from_entity(entity="item"),
            ],
            "delivery_preference": [
                self.from_entity(entity="delivery_preference"),
            ],
            # Dla address w ogóle nie dajemy slot mapping, 
            # bo domain.yml ma - type: from_text.
            # "address": [
            #     self.from_text(),
            # ],
        }

    def validate_item(
        self,
        value: Text,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> Dict[Text, Any]:
        """Walidacja slotu 'item'."""
        item_normalized = value.capitalize() if value else ""
        if item_normalized in menu:
            return {"item": item_normalized}
        else:
            dispatcher.utter_message(text=f"Przykro mi, nie mamy {value} w menu.")
            return {"item": None}

    def validate_delivery_preference(
        self,
        value: Text,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> Dict[Text, Any]:
        """Walidacja slotu 'delivery_preference'."""
        valid_preferences = ["delivery", "pickup"]
        if not value:
            dispatcher.utter_message(text="Proszę wybrać dostawę lub odbiór.")
            return {"delivery_preference": None}

        preference = value.lower()
        if preference not in valid_preferences:
            dispatcher.utter_message(text="Proszę wybrać dostawę lub odbiór.")
            return {"delivery_preference": None}

        # Jeśli user wybiera "pickup", czyścimy address
        if preference == "pickup":
            return {"delivery_preference": "pickup", "address": None}
        else:
            return {"delivery_preference": "delivery"}

    def validate_address(
        self,
        value: Text,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> Dict[Text, Any]:
        delivery_preference = tracker.get_slot("delivery_preference")

        if delivery_preference == "delivery":
            lowered = (value or "").strip().lower()
            
            if "dostaw" in lowered and "ul." not in lowered:
                # Zamiast dispatcher.utter_message(...) -> brak
                return {"address": None}
            
            words = lowered.split()
            if len(words) < 2:
                # Zamiast dispatcher.utter_message(...) -> brak
                return {"address": None}
            
            if lowered:
                return {"address": lowered}
            else:
                # Zamiast dispatcher.utter_message(...) -> brak
                return {"address": None}

        return {"address": None}




class ActionCheckOpeningHours(Action):
    def name(self) -> Text:
        return "action_check_opening_hours"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:
        hours_message = "Godziny otwarcia:\n"
        for day, hours in opening_hours.items():
            if hours["open"] == 0 and hours["close"] == 0:
                hours_message += f"{day}: Zamknięte\n"
            else:
                hours_message += f"{day}: {hours['open']}:00 - {hours['close']}:00\n"
        dispatcher.utter_message(text=hours_message)
        return []


class ActionShowMenu(Action):
    def name(self) -> Text:
        return "action_show_menu"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:
        menu_items = "\n".join([f"- {item}" for item in menu.keys()])
        dispatcher.utter_message(text=f"Oto nasze menu:\n{menu_items}")
        return []


class ActionSummary(Action):
    """Akcja wyświetlająca krótkie podsumowanie zamówienia przed potwierdzeniem."""

    def name(self) -> Text:
        return "action_summary"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:
        item = tracker.get_slot("item")
        delivery_preference = tracker.get_slot("delivery_preference")
        address = tracker.get_slot("address")

        order_details = menu.get(item, {})
        summary_text = f"Zamawiasz: {item}.\n"

        if delivery_preference == "delivery":
            summary_text += "Sposób: Dostawa.\n"
            if address:
                summary_text += f"Adres: {address}.\n"
            # Zakładamy, że w menu jest np. "preparation_time"=1.0
            prep_time = order_details.get("preparation_time", 1.0) + 0.5
            summary_text += f"Czas realizacji: {prep_time} h.\n"
        else:
            summary_text += "Sposób: Odbiór osobisty.\n"
            prep_time = order_details.get("preparation_time", 1.0)
            summary_text += f"Czas realizacji: {prep_time} h.\n"

        dispatcher.utter_message(text=summary_text)
        return []


class ActionConfirmOrder(Action):
    def name(self) -> Text:
        return "action_confirm_order"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:
        item = tracker.get_slot("item")
        delivery_preference = tracker.get_slot("delivery_preference")
        address = tracker.get_slot("address")

        # Znajdź szczegóły w menu
        order_details = menu.get(item, {})
        if not order_details:
            dispatcher.utter_message(text="Ups! Nie rozpoznano zamówienia.")
            return []

        # Uzupełnij info
        order_details["item"] = item
        # Cena = cena dania + ewentualny koszt dostawy
        if delivery_preference == "delivery":
            total_price = float(order_details["price"]) + float(delivery_cost)
            order_details["total_price"] = total_price
            order_details["address"] = address
        else:
            total_price = float(order_details["price"])
            order_details["total_price"] = total_price
            order_details["pickup_address"] = pickup_address
            # Wymaż klucz address, jeśli istnieje
            if "address" in order_details:
                del order_details["address"]

        # Zapisz do pliku JSON
        save_order_to_file(order_details)

        # Wyświetl finalne potwierdzenie
        if delivery_preference == "delivery":
            prep_time_hours = order_details["preparation_time"] + 0.5
            preparation_time_value = datetime.now() + timedelta(hours=prep_time_hours)
            preparation_time_str = preparation_time_value.strftime("%Y-%m-%d %H:%M:%S")

            dispatcher.utter_message(
                response="utter_confirm_order_delivery",
                preparation_time=preparation_time_str,
            )
        else:
            prep_time_hours = order_details["preparation_time"]
            preparation_time_value = datetime.now() + timedelta(hours=prep_time_hours)
            preparation_time_str = preparation_time_value.strftime("%Y-%m-%d %H:%M:%S")

            dispatcher.utter_message(
                response="utter_confirm_order_pickup",
                preparation_time=preparation_time_str,
            )

        # Wyczyszczenie slotów
        return [AllSlotsReset()]


class ActionHandleDisagreement(Action):
    def name(self) -> Text:
        return "action_handle_disagreement"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:
        dispatcher.utter_message(text="Zamówienie zosatło anulowane.")
        return [AllSlotsReset()]


class ActionCancelOrder(Action):
    def name(self) -> Text:
        return "action_cancel_order"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:
        dispatcher.utter_message(text="Zamówienie zostało anulowane.")
        return [AllSlotsReset()]