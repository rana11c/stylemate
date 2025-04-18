import os
import json
import requests
from datetime import datetime, timedelta
import random

# Weather API key
WEATHER_API_KEY = os.environ.get("WEATHER_API_KEY", "")

def get_weather_forecast(city="Riyadh"):
    """
    Get weather forecast for the specified city
    If no API key is available, returns simulated weather data
    """
    if WEATHER_API_KEY:
        try:
            # Use a weather API service
            url = f"https://api.weatherapi.com/v1/forecast.json?key={WEATHER_API_KEY}&q={city}&days=7&lang=ar"
            response = requests.get(url)
            data = response.json()
            
            # Extract relevant information
            forecast = {
                "today": {
                    "temp": data["current"]["temp_c"],
                    "condition": data["current"]["condition"]["text"],
                    "icon": data["current"]["condition"]["icon"],
                    "is_day": data["current"]["is_day"] == 1
                },
                "tomorrow": {
                    "temp": data["forecast"]["forecastday"][1]["day"]["avgtemp_c"],
                    "condition": data["forecast"]["forecastday"][1]["day"]["condition"]["text"],
                    "icon": data["forecast"]["forecastday"][1]["day"]["condition"]["icon"]
                },
                "after_tomorrow": {
                    "temp": data["forecast"]["forecastday"][2]["day"]["avgtemp_c"],
                    "condition": data["forecast"]["forecastday"][2]["day"]["condition"]["text"],
                    "icon": data["forecast"]["forecastday"][2]["day"]["condition"]["icon"]
                },
                "three_days_later": {
                    "temp": data["forecast"]["forecastday"][3]["day"]["avgtemp_c"],
                    "condition": data["forecast"]["forecastday"][3]["day"]["condition"]["text"],
                    "icon": data["forecast"]["forecastday"][3]["day"]["condition"]["icon"]
                }
            }
            
            return forecast
        except Exception as e:
            # Fall back to simulated data if API call fails
            print(f"Weather API error: {e}")
            return get_simulated_weather()
    else:
        # Use simulated weather data if no API key is available
        return get_simulated_weather()

def get_simulated_weather():
    """Generate simulated weather data for demo purposes"""
    # Weather conditions in Arabic
    conditions = ["مشمس", "غائم جزئياً", "غائم", "ممطر خفيف", "عاصف"]
    condition_icons = [
        "https://images.unsplash.com/photo-1531789694268-03cfe5989f89", # sunny
        "https://images.unsplash.com/photo-1744701819701-2359529e445b", # partly cloudy
        "https://images.unsplash.com/photo-1744701820154-5c4c07cfb803", # cloudy
        "https://images.unsplash.com/photo-1744701818511-1ed44d01e97f"  # rainy
    ]
    
    # Create simulated forecast
    today_temp = 27
    today_condition = conditions[0]  # Sunny
    today_icon = condition_icons[0]
    
    tomorrow_temp = 23
    tomorrow_condition = conditions[1]  # Partly cloudy
    tomorrow_icon = condition_icons[1]
    
    after_tomorrow_temp = 25
    after_tomorrow_condition = conditions[0]  # Sunny
    after_tomorrow_icon = condition_icons[0]
    
    three_days_later_temp = 22
    three_days_later_condition = conditions[2]  # Cloudy
    three_days_later_icon = condition_icons[2]
    
    return {
        "today": {
            "temp": today_temp,
            "condition": today_condition,
            "icon": today_icon,
            "is_day": True
        },
        "tomorrow": {
            "temp": tomorrow_temp,
            "condition": tomorrow_condition,
            "icon": tomorrow_icon
        },
        "after_tomorrow": {
            "temp": after_tomorrow_temp,
            "condition": after_tomorrow_condition,
            "icon": after_tomorrow_icon
        },
        "three_days_later": {
            "temp": three_days_later_temp,
            "condition": three_days_later_condition,
            "icon": three_days_later_icon
        }
    }

def get_arabic_date():
    """Get the current date in Arabic format"""
    today = datetime.now()
    
    # Day of week in Arabic
    days_ar = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]
    day_name = days_ar[today.weekday()]
    
    # Islamic month (simplified, would need Hijri calendar library for accurate conversion)
    months_ar = [
        "محرم", "صفر", "ربيع الأول", "ربيع الثاني", "جمادى الأولى", "جمادى الآخرة",
        "رجب", "شعبان", "رمضان", "شوال", "ذو القعدة", "ذو الحجة"
    ]
    # For demo, we'll just use a placeholder month
    month_name = "شوال"
    
    # Convert day number to Arabic numerals
    day_num = convert_to_arabic_numerals(today.day)
    
    return f"{day_name}، {day_num} {month_name}"

def convert_to_arabic_numerals(num):
    """Convert western numerals to Arabic numerals"""
    # Map of Western to Arabic numerals
    arabic_numerals = {
        '0': '٠', '1': '١', '2': '٢', '3': '٣', '4': '٤',
        '5': '٥', '6': '٦', '7': '٧', '8': '٨', '9': '٩'
    }
    
    # Convert the number to a string and then replace each digit
    num_str = str(num)
    arabic_num = ''.join([arabic_numerals[digit] for digit in num_str])
    
    return arabic_num
