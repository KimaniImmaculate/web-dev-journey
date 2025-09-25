const Calculator = {
  currentInput: '',
  // Stores the previous input for binary operations
  previousInput: '',
  operator: '',
  shouldResetDisplay: false,
  history: [],
  display: document.getElementById('display'),
  historyList: document.getElementById('history-list'),
  historyPanel: document.getElementById('history-panel'),

  // Appends a value to the current input or handles special functions/operators
  appendToDisplay(value) {
    if (this.currentInput === 'Error') {
      // Clear display if an error occurred previously
      this.clearDisplay();
    }
    if (this.shouldResetDisplay && !this.isOperator(value) && !this.isScientificFunction(value)) {
      this.currentInput = '';
      this.shouldResetDisplay = false;
    }
    if (this.isScientificFunction(value)) {
      this.handleScientificFunction(value);
    } else if (this.isOperator(value)) {
      this.handleOperator(value);
    } else if (value === '.') {
      this.handleDecimal();
    } else {
      this.handleNumber(value);
    }
    this.updateDisplay();
  },

  // Handles number input
  handleNumber(number) {
    if (this.currentInput === '0' && number === '0') return;
    if (this.currentInput === '0' && number !== '0' && !this.currentInput.includes('.')) {
      this.currentInput = number;
      // Limit input length to prevent overflow
    } else if (this.currentInput.length < 12) {
      this.currentInput += number;
    }
  },

  handleDecimal() {
    if (!this.currentInput.includes('.')) {
      // Add a leading zero if decimal is the first input
      this.currentInput = this.currentInput || '0';
      this.currentInput += '.';
    }
  },

  handleScientificFunction(func) {
    // Only perform function if there's a number to operate on
    if (this.currentInput !== '') {
      const num = parseFloat(this.currentInput);
      let result;
      try {
        switch (func) {
          case 'sqrt':
            if (num < 0) throw new Error('Invalid input');
            result = Math.sqrt(num);
            break;
          case 'sin':
            result = Math.sin((num * Math.PI) / 180); // Convert degrees to radians
            break;
          case 'cos':
            result = Math.cos((num * Math.PI) / 180); // Convert degrees to radians
            break;
          default:
            throw new Error('Invalid function');
        }
        // Format result to avoid floating point inaccuracies and remove trailing zeros
        this.currentInput = Number(result.toFixed(10)).toString().replace(/\.?0+$/, '');
        this.shouldResetDisplay = true;
      } catch (error) {
        this.currentInput = 'Error';
        this.shouldResetDisplay = true;
      }
    }
  },

  handleOperator(op) {
    // If there's a pending operation, calculate it first
    if (this.currentInput !== '' && this.previousInput !== '' && this.operator !== '') {
      this.calculate();
    }
    if (op === '^' && this.currentInput !== '') {
      // Special handling for power operator to allow chaining
      this.previousInput = this.currentInput;
      this.currentInput = '';
      this.operator = op;
    } else if (this.currentInput !== '') {
      this.previousInput = this.currentInput;
      this.currentInput = '';
      this.operator = op;
    } else if (this.previousInput !== '') {
      this.operator = op;
    }
  },

  // Checks if a value is an arithmetic operator
  isOperator(value) {
    return ['+', '-', '*', '/', '^'].includes(value);
  },

  // Checks if a value is a scientific function
  isScientificFunction(value) {
    return ['sqrt', 'sin', 'cos'].includes(value);
  },

  // Performs the calculation based on the stored operator
  calculate() {
    if (this.previousInput === '' || this.currentInput === '' || this.operator === '') {
      return;
    }
    const prev = parseFloat(this.previousInput);
    const current = parseFloat(this.currentInput);
    let result;
    try {
      switch (this.operator) {
        case '+':
          result = prev + current;
          break;
        case '-':
          result = prev - current;
          break;
        case '*':
          result = prev * current;
          break;
        case '/':
          // Handle division by zero error
          if (current === 0) throw new Error('Cannot divide by zero');
          result = prev / current;
          break;
        case '^':
          result = Math.pow(prev, current);
          break;
        default:
          throw new Error('Invalid operator');
      }
      // Construct expression for history and format result
      const expression = `${prev} ${this.operator} ${current} = ${Number(result.toFixed(10)).toString().replace(/\.?0+$/, '')}`;
      this.addToHistory(expression);
      this.currentInput = Number(result.toFixed(10)).toString().replace(/\.?0+$/, '');
    } catch (error) {
      this.currentInput = 'Error';
      this.addToHistory(`${prev} ${this.operator} ${current} = Error`);
    }
    this.previousInput = '';
    this.operator = '';
    this.shouldResetDisplay = true;
    this.updateDisplay();
  },

  // Clears all calculator state
  clearDisplay() {
    this.currentInput = '';
    this.previousInput = '';
    this.operator = '';
    this.shouldResetDisplay = false;
    this.updateDisplay();
  },

  // Deletes the last character from the current input
  deleteLast() {
    if (this.currentInput !== '' && this.currentInput !== 'Error') {
      this.currentInput = this.currentInput.slice(0, -1);
      this.updateDisplay();
    }
  },

  // Updates the display element with the current input
  updateDisplay() {
    let displayValue = this.currentInput || '0';
    this.display.classList.remove('error', 'small-font');
    if (displayValue === 'Error') {
      this.display.classList.add('error');
      // Apply small font for long numbers
    } else if (!isNaN(displayValue) && displayValue !== '') {
      const num = parseFloat(displayValue);
      if (Math.abs(num) >= 1000) {
        displayValue = num.toLocaleString('en-US', { maximumFractionDigits: 10 });
        // Apply small font for long numbers
      }
      if (displayValue.length > 10) {
        this.display.classList.add('small-font');
      }
    }
    this.display.value = displayValue;
  },

  // Adds an expression to the history list
  addToHistory(expression) {
    this.history.unshift(expression);
    // Keep history limited to 10 entries
    if (this.history.length > 10) {
      this.history.pop();
    }
    this.updateHistoryPanel();
  },

  updateHistoryPanel() {
    // Clears and repopulates the history list in the UI
    this.historyList.innerHTML = '';
    this.history.forEach(entry => {
      const li = document.createElement('li');
      li.textContent = entry;
      this.historyList.appendChild(li);
    });
  },

  // Toggles the visibility of the history panel
  toggleHistory() {
    this.historyPanel.classList.toggle('active');
    const button = document.querySelector('.history-toggle');
    button.textContent = this.historyPanel.classList.contains('active') ? 'Hide History' : 'Show History';
  },

  // Toggles between light and dark themes
  toggleTheme() {
    document.body.classList.toggle('light-mode');
    const button = document.querySelector('.theme-toggle');
    button.textContent = document.body.classList.contains('light-mode') ? 'Dark Mode' : 'Light Mode';
  }
};

// Event listener for keyboard input
document.addEventListener('keydown', function(event) {
  event.preventDefault();
  const key = event.key;
  let button;
  if (key >= '0' && key <= '9') {
    button = document.querySelector(`.btn[onclick="Calculator.appendToDisplay('${key}')"]`);
    Calculator.appendToDisplay(key);
  } else if (['+', '-', '*', '/'].includes(key)) {
    button = document.querySelector(`.btn[onclick="Calculator.appendToDisplay('${key}')"]`);
    Calculator.appendToDisplay(key);
  } else if (key === '.' || key === ',') {
    button = document.querySelector(`.btn[onclick="Calculator.appendToDisplay('.')"]`);
    Calculator.appendToDisplay('.');
  } else if (key === 'Enter' || key === '=') {
    // Trigger calculation on Enter or =
    button = document.querySelector('.equals');
    Calculator.calculate();
  } else if (key === 'Escape' || key === 'c' || key === 'C') {
    button = document.querySelector(`.btn[onclick="Calculator.clearDisplay()"]`);
    Calculator.clearDisplay();
  } else if (key === 'Backspace') {
    button = document.querySelector(`.btn[onclick="Calculator.deleteLast()"]`);
    Calculator.deleteLast();
  } else if (key === 's' || key === 'S') {
    button = document.querySelector(`.btn[onclick="Calculator.appendToDisplay('sin')"]`);
    Calculator.appendToDisplay('sin');
  } else if (key === 'c' || key === 'C') {
    button = document.querySelector(`.btn[onclick="Calculator.appendToDisplay('cos')"]`);
    Calculator.appendToDisplay('cos');
  } else if (key === 'r' || key === 'R') {
    button = document.querySelector(`.btn[onclick="Calculator.appendToDisplay('sqrt')"]`);
    Calculator.appendToDisplay('sqrt');
  } else if (key === '^') {
    button = document.querySelector(`.btn[onclick="Calculator.appendToDisplay('^')"]`);
    Calculator.appendToDisplay('^');
  }
  // Add visual feedback for pressed buttons
  if (button) {
    button.classList.add('pressed');
    setTimeout(() => button.classList.remove('pressed'), 100);
  }
});

// Event listener for button click feedback
document.querySelectorAll('.btn').forEach(button => {
  button.addEventListener('click', () => {
    button.classList.add('pressed');
    setTimeout(() => button.classList.remove('pressed'), 100);
  });
});

// Initialize display
Calculator.updateDisplay();

// Initialize history panel
Calculator.updateHistoryPanel();