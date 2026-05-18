import { collection, addDoc, serverTimestamp, getDocs, query, limit } from 'firebase/firestore';
import { db } from './firebase';
import { User } from 'firebase/auth';

const ADMIN_EMAIL = 'ruziyvdima@gmail.com';

const ROBOTICS_PRODUCTS = [
  {
    name_uz: "Arduino Uno R3 Original",
    name_en: "Arduino Uno R3 Original",
    name_ru: "Arduino Uno R3 Оригинал",
    price: 25.00,
    stock: 50,
    category: "robotics",
    image: "https://images.unsplash.com/photo-1608564697171-2ab67a6a093a?auto=format&fit=crop&q=80&w=400",
    description_uz: "Mashhur mikrocontroller platformasi.",
    description_en: "Popular microcontroller platform.",
    description_ru: "Популярная платформа микроконтроллеров."
  },
  {
    name_uz: "Raspberry Pi 4 Model B (8GB)",
    name_en: "Raspberry Pi 4 Model B (8GB)",
    name_ru: "Raspberry Pi 4 Model B (8GB)",
    price: 75.00,
    stock: 15,
    category: "robotics",
    image: "https://images.unsplash.com/photo-1610018556010-6a11b77a9055?auto=format&fit=crop&q=80&w=400",
    description_uz: "Yuqori unumdorlikka ega mikrokompyuter.",
    description_en: "High-performance microcomputer.",
    description_ru: "Высокопроизводительный микрокомпьютер."
  },
  {
    name_uz: "MG996R Servo Motor",
    name_en: "MG996R Servo Motor",
    name_ru: "Сервопривод MG996R",
    price: 12.50,
    stock: 40,
    category: "components",
    image: "https://images.unsplash.com/photo-159742324403d-d1ef61703e91?auto=format&fit=crop&q=80&w=400",
    description_uz: "Kuchli servo motor.",
    description_en: "Powerful servo motor.",
    description_ru: "Мощный сервопривод."
  },
  {
    name_uz: "RPLidar A1",
    name_en: "RPLidar A1",
    name_ru: "Лидар RPLidar A1",
    price: 120.00,
    stock: 5,
    category: "sensors",
    image: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=400",
    description_uz: "360 darajali lazer skaner.",
    description_en: "360 degree laser scanner.",
    description_ru: "360-градусный лазерный сканер."
  },
  {
    name_uz: "4WD Robot Shassisi",
    name_en: "4WD Robot Chassis",
    name_ru: "Шасси робота 4WD",
    price: 35.00,
    stock: 20,
    category: "robotics",
    image: "https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&q=80&w=400",
    description_uz: "To'rt g'ildirakli robot platformasi.",
    description_en: "Four-wheel robot platform.",
    description_ru: "Четырехколесная робот-платформа."
  },
  {
    name_uz: "Jetson Nano Kit",
    name_en: "Jetson Nano Kit",
    name_ru: "Jetson Nano Kit",
    price: 150.00,
    stock: 8,
    category: "robotics",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400",
    description_uz: "Sun'iy intellekt loyihalari uchun.",
    description_en: "For AI projects.",
    description_ru: "Для проектов ИИ."
  },
  {
    name_uz: "ESP32-WROOM-32",
    name_en: "ESP32-WROOM-32",
    name_ru: "ESP32-WROOM-32",
    price: 6.50,
    stock: 100,
    category: "components",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400",
    description_uz: "Wi-Fi va Bluetooth moduli.",
    description_en: "Wi-Fi and Bluetooth module.",
    description_ru: "Wi-Fi и Bluetooth модуль."
  },
  {
    name_uz: "Ultrasonik Sensor HC-SR04",
    name_en: "Ultrasonic Sensor HC-SR04",
    name_ru: "Ультразвуковой датчик HC-SR04",
    price: 3.20,
    stock: 200,
    category: "sensors",
    image: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?auto=format&fit=crop&q=80&w=400",
    description_uz: "Masofani aniqlash sensori.",
    description_en: "Distance measurement sensor.",
    description_ru: "Датчик измерения расстояния."
  },
  {
    name_uz: "OLED Displey 0.96 I2C",
    name_en: "OLED Display 0.96 I2C",
    name_ru: "OLED Дисплей 0.96 I2C",
    price: 7.50,
    stock: 60,
    category: "components",
    image: "https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&q=80&w=400",
    description_uz: "Kichik OLED displey.",
    description_en: "Small OLED display.",
    description_ru: "Маленький OLED дисплей."
  },
  {
    name_uz: "L298N Motor Drayveri",
    name_en: "L298N Motor Driver",
    name_ru: "Драйвер мотора L298N",
    price: 5.50,
    stock: 120,
    category: "robotics",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400",
    description_uz: "Ikki kanalli motor drayveri.",
    description_en: "Dual channel motor driver.",
    description_ru: "Двухканальный драйвер мотора."
  },
  {
    name_uz: "TP4056 Quvvatlash Moduli",
    name_en: "TP4056 Charger Module",
    name_ru: "Зарядное устройство TP4056",
    price: 1.50,
    stock: 300,
    category: "components",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400",
    description_uz: "Li-ion batareyalarni quvvatlash uchun.",
    description_en: "For charging Li-ion batteries.",
    description_ru: "Для зарядки Li-ion аккумуляторов."
  },
  {
    name_uz: "DHT11 Sensor",
    name_en: "DHT11 Temp & Humidity",
    name_ru: "Датчик DHT11",
    price: 3.50,
    stock: 150,
    category: "sensors",
    image: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=400",
    description_uz: "Harorat va namlik sensori.",
    description_en: "Temperature and humidity sensor.",
    description_ru: "Датчик температуры и влажности."
  },
  {
    name_uz: "Breadboard MB-102",
    name_en: "Breadboard MB-102",
    name_ru: "Макетная плата MB-102",
    price: 4.80,
    stock: 200,
    category: "tools",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=400",
    description_uz: "Loyiha yaratish uchun maket plata.",
    description_en: "For prototyping projects.",
    description_ru: "Для прототипирования проектов."
  },
  {
    name_uz: "Jumper Simlar (40 dona)",
    name_en: "Jumper Wires (40 pcs)",
    name_ru: "Перемычки (40 шт)",
    price: 2.50,
    stock: 500,
    category: "tools",
    image: "https://images.unsplash.com/photo-1558444479-c8a02e624c3e?auto=format&fit=crop&q=80&w=400",
    description_uz: "Loyiha simlari.",
    description_en: "Project wires.",
    description_ru: "Соединительные провода."
  },
  {
    name_uz: "DS18B20 Suv o'tkazmaydigan sensor",
    name_en: "DS18B20 Waterproof Sensor",
    name_ru: "Водонепроницаемый датчик DS18B20",
    price: 6.20,
    stock: 80,
    category: "sensors",
    image: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=400",
    description_uz: "Suv o'tkazmaydigan harorat sensori.",
    description_en: "Waterproof temperature sensor.",
    description_ru: "Водонепроницаемый температурный датчик."
  },
  {
    name_uz: "Nema 17 Stepper Motor",
    name_en: "Nema 17 Stepper Motor",
    name_ru: "Шаговый двигатель Nema 17",
    price: 18.00,
    stock: 45,
    category: "components",
    image: "https://images.unsplash.com/photo-1590760441865-c3f2187756f7?auto=format&fit=crop&q=80&w=400",
    description_uz: "3D printerlar uchun qadamli motor.",
    description_en: "Stepper motor for 3D printers.",
    description_ru: "Шаговый двигатель для 3D принтеров."
  },
  {
    name_uz: "A4988 Drayveri",
    name_en: "A4988 Stepper Driver",
    name_ru: "Драйвер A4988",
    price: 3.50,
    stock: 120,
    category: "components",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400",
    description_uz: "Qadamli motor drayveri.",
    description_en: "Stepper motor driver.",
    description_ru: "Драйвер шагового двигателя."
  },
  {
    name_uz: "18650 Batareya 3000mAh",
    name_en: "18650 Battery 3000mAh",
    name_ru: "Аккумулятор 18650 3000mAh",
    price: 8.00,
    stock: 150,
    category: "batteries",
    image: "https://images.unsplash.com/photo-1590760441865-c3f2187756f7?auto=format&fit=crop&q=80&w=400",
    description_uz: "Li-ion batareya.",
    description_en: "Li-ion battery.",
    description_ru: "Li-ion аккумулятор."
  },
  {
    name_uz: "MQ-2 Gaz Sensori",
    name_en: "MQ-2 Gas Sensor",
    name_ru: "Датчик газа MQ-2",
    price: 4.50,
    stock: 70,
    category: "sensors",
    image: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=400",
    description_uz: "Gaz va tutun aniqlash sensori.",
    description_en: "Gas and smoke detection sensor.",
    description_ru: "Датчик газа и дыма."
  },
  {
    name_uz: "Infraqizil Masofa Sensori",
    name_en: "Infrared Range Sensor",
    name_ru: "ИК-датчик расстояния",
    price: 10.50,
    stock: 40,
    category: "sensors",
    image: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=400",
    description_uz: "Sharp IR masofa sensori.",
    description_en: "Sharp IR distance sensor.",
    description_ru: "ИК-датчик расстояния Sharp."
  },
  {
    name_uz: "Robot Qo'l (4 DOF)",
    name_en: "Robot Arm (4 DOF)",
    name_ru: "Робот-манипулятор (4 DOF)",
    price: 45.00,
    stock: 10,
    category: "robotics",
    image: "https://images.unsplash.com/photo-159742324403d-d1ef61703e91?auto=format&fit=crop&q=80&w=400",
    description_uz: "To'rt darajali robot qo'l.",
    description_en: "Four degree of freedom robot arm.",
    description_ru: "Робот-манипулятор с 4 степенями свободы."
  },
  {
    name_uz: "Bluetooth Moduli HC-05",
    name_en: "Bluetooth Module HC-05",
    name_ru: "Bluetooth модуль HC-05",
    price: 8.50,
    stock: 90,
    category: "components",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400",
    description_uz: "Wireless bluetooth aloqa.",
    description_en: "Wireless bluetooth communication.",
    description_ru: "Беспроводная Bluetooth связь."
  },
  {
    name_uz: "Solnechnaya Panel 6V 1W",
    name_en: "Solar Panel 6V 1W",
    name_ru: "Солнечная панель 6V 1W",
    price: 5.50,
    stock: 120,
    category: "power",
    image: "https://images.unsplash.com/photo-1591115765373-520b7a21769b?auto=format&fit=crop&q=80&w=400",
    description_uz: "Quyosh energiyasi paneli.",
    description_en: "Solar energy panel.",
    description_ru: "Солнечная панель."
  },
  {
    name_uz: "TTP223 Sensor",
    name_en: "TTP223 Touch Sensor",
    name_ru: "Сенсор TTP223",
    price: 1.20,
    stock: 400,
    category: "sensors",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400",
    description_uz: "Sensorli tugma.",
    description_en: "Touch sensitive button.",
    description_ru: "Сенсорная кнопка."
  },
  {
    name_uz: "MPU6050 Gyroscope",
    name_en: "MPU6050 Gyroscope",
    name_ru: "Гироскоп MPU6050",
    price: 4.80,
    stock: 110,
    category: "sensors",
    image: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=400",
    description_uz: "Akselerometr va giroskop.",
    description_en: "Accelerometer and gyroscope.",
    description_ru: "Акселерометр и гироскоп."
  },
  {
    name_uz: "Micro Servo SG90",
    name_en: "Micro Servo SG90",
    name_ru: "Микро сервопривод SG90",
    price: 3.50,
    stock: 250,
    category: "components",
    image: "https://images.unsplash.com/photo-159742324403d-d1ef61703e91?auto=format&fit=crop&q=80&w=400",
    description_uz: "Kichik servo motor.",
    description_en: "Small servo motor.",
    description_ru: "Маленький сервопривод."
  },
  {
    name_uz: "3D Printerli Filament PLA",
    name_en: "PLA Filament 1.75mm",
    name_ru: "PLA пластик 1.75мм",
    price: 22.00,
    stock: 30,
    category: "tools",
    image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=400",
    description_uz: "3D bosma uchun plastik.",
    description_en: "Plastic for 3D printing.",
    description_ru: "Пластик для 3D печати."
  },
  {
    name_uz: "Soldering Iron Kit",
    name_en: "Soldering Iron Kit",
    name_ru: "Набор для пайки",
    price: 28.00,
    stock: 25,
    category: "tools",
    image: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80&w=400",
    description_uz: "Paykalash to'plami.",
    description_en: "Soldering toolkit.",
    description_ru: "Набор для пайки."
  },
  {
    name_uz: "ESP8266 NodeMCU",
    name_en: "ESP8266 NodeMCU",
    name_ru: "ESP8266 NodeMCU",
    price: 5.50,
    stock: 140,
    category: "components",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400",
    description_uz: "Wi-Fi mikrocontroller.",
    description_en: "Wi-Fi microcontroller.",
    description_ru: "Wi-Fi микроконтроллер."
  },
  {
    name_uz: "USB Logic Analyzer",
    name_en: "USB Logic Analyzer",
    name_ru: "USB логический анализатор",
    price: 15.00,
    stock: 35,
    category: "tools",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=400",
    description_uz: "Signal tahlil qilish asbobi.",
    description_en: "Signal analysis tool.",
    description_ru: "Инструмент для анализа сигналов."
  },
  {
    name_uz: "Buzzer Moduli",
    name_en: "Buzzer Module",
    name_ru: "Модуль пищалки",
    price: 1.80,
    stock: 220,
    category: "components",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400",
    description_uz: "Ovoz chiqaruvchi modul.",
    description_en: "Sound emission module.",
    description_ru: "Звуковой модуль."
  },
  {
    name_uz: "DS3231 RTC Moduli",
    name_en: "DS3231 RTC Module",
    name_ru: "Модуль часов DS3231",
    price: 4.20,
    stock: 65,
    category: "components",
    image: "https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&q=80&w=400",
    description_uz: "Aniq vaqt moduli.",
    description_en: "Real time clock module.",
    description_ru: "Модуль часов реального времени."
  }
];

export async function seedProducts(user: User | null) {
  if (!user || !user.email || user.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) return;
  const existing = await getDocs(query(collection(db, 'products'), limit(1)));
  if (existing.empty) {
    console.log('Seeding products...');
    for (const product of ROBOTICS_PRODUCTS) {
      await addDoc(collection(db, 'products'), {
        ...product,
        updatedAt: serverTimestamp()
      });
    }
    console.log('Seed completed.');
  }
}
