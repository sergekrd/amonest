export function validateName(name: string): boolean {
    // Проверка на длину имени
    if (name.length < 2) {
        throw new Error ('Имя должно содержать не меньше двух букв')      
    }
  
    // Проверка на допустимые символы (буквы, пробелы и дефисы)
    if (!/^[а-яА-Я\s\-]*$/.test(name)) {
        throw new Error ('Имя должно содержать только русские символы')      
    }  
    return true;
  }

  export  function validateLastName(name: string): boolean {
    // Проверка на длину фамилии
    if (name.length < 2) {
        throw new Error ('Фамилия должна содержать не меньше двух букв')      
    }
  
    // Проверка на допустимые символы (буквы, пробелы и дефисы)
    if (!/^[а-яА-Я\s\-]*$/.test(name)) {
        throw new Error ('Фамилия должна содержать только русские символы')      
    }  
    return true;
  }
  
  // Валидация email
  export  function validateEmail(email: string): boolean {
    // Проверка на наличие символа "@"
    if (!email.includes('@')) {
        throw new Error ('Неверный формат почты, укажите в формате aaaa@bbbb.cc Нет символа "@"')        
    }
  
    // Проверка на наличие символа "." после "@"
    if (!email.split('@')[1].includes('.')) {
        throw new Error ('Неверный формат почты, укажите в формате aaaa@bbbb.cc Нет символа "."')    
      return false;
    }
  
    // Дополнительная проверка общей структуры email (регулярное выражение)
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email)) {
        throw new Error ('Неверный формат почты, используйте латинские сиволы и цифры')   
    }
  
    return true;
  }
  
  // Валидация номера телефона (Phone Number)
  export  function validatePhoneNumber(phoneNumber: string): string {
     // Удаление символов нецифровых символов
     const cleanedPhoneNumber = phoneNumber.replace(/[^\dА-Яа-яA-Za-z]/g, '');

    // Проверка на наличие только цифр
    if (!/^\d+$/.test(cleanedPhoneNumber)) {
        throw new Error ('Неверный формат номера телефона, используйте только цифры') 
    }
  
    // Проверка на количество цифр (например, 10 цифр)
    if (cleanedPhoneNumber.length < 11) {
        throw new Error ('Неверный формат номера телефона, слишком короткий номер телефона. Укажите в формате +7 999 888 77 66') 
      
    }
  const phone=`+${cleanedPhoneNumber}`
    return phone;
  }