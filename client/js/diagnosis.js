document.addEventListener('DOMContentLoaded', function() {
    const diagnosisForm = document.getElementById('diagnosisForm');
    const resultContainer = document.getElementById('resultContainer');
    const resultContent = document.getElementById('resultContent');
    
    diagnosisForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate form
        if (!validateForm()) {
            return;
        }
        
        // Show loading state
        showLoading();
        
        // call api model
        // fetchDiagnosisResult();
        
        setTimeout(processDiagnosisResult, 2000);
    });
    
    function validateForm() {
        // Get form values
        const age = document.getElementById('age').value;
        const bmi = document.getElementById('bmi').value;
        const systolicPressure = document.getElementById('systolicPressure').value;
        const diastolicPressure = document.getElementById('diastolicPressure').value;
        const glucose = document.getElementById('glucose').value;
        const diabetesPedigreeFunction = document.getElementById('diabetesPedigreeFunction').value;
        const numberOfHospitalDays = document.getElementById('numberOfHospitalDays').value;
        const widsDrugs = document.getElementById('widsDrugs').value;
        
        
        // Basic validation (can be enhanced)
        if (!age || !bmi || !systolicPressure || !diastolicPressure || !glucose || !diabetesPedigreeFunction || !numberOfHospitalDays || !widsDrugs) {
            alert('Vui lòng điền đầy đủ thông tin');
            return false;
        }
        
        return true;
    }
    
    function showLoading() {
        resultContainer.classList.remove('hidden');
        resultContent.innerHTML = `
            <div class="flex justify-center items-center py-4">
                <svg class="animate-spin h-8 w-8 text-primary dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span class="ml-3 text-gray-700 dark:text-gray-300">Đang phân tích dữ liệu...</span>
            </div>
        `;
    }
    
    function fetchDiagnosisResult() {
        /*
        fetch('/api/diagnose', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                age: parseInt(document.getElementById('age').value),
                gender: document.getElementById('gender').value,
                glucose: parseInt(document.getElementById('glucose').value),
                bmi: parseFloat(document.getElementById('bmi').value),
                bloodPressure: parseInt(document.getElementById('bloodPressure').value),
                familyHistory: document.getElementById('familyHistory').value === 'yes'
            }),
        })
        .then(response => response.json())
        .then(data => {
            displayResult(data);
        })
        .catch(error => {
            console.error('Error:', error);
            resultContent.innerHTML = `
                <div class="p-4 bg-red-50 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400">
                    Đã xảy ra lỗi trong quá trình chẩn đoán. Vui lòng thử lại sau.
                </div>
            `;
        });
        */
    }
    
    function processDiagnosisResult() {
        // Get form values
        
        const age = parseInt(document.getElementById('age').value);
        const bmi = parseFloat(document.getElementById('bmi').value);
        const systolicPressure = parseFloat(document.getElementById('systolicPressure').value);
        const diastolicPressure = parseFloat(document.getElementById('diastolicPressure').value);
        const glucose = parseFloat(document.getElementById('glucose').value);
        const diabetesPedigreeFunction = parseFloat(document.getElementById('diabetesPedigreeFunction').value);
        const numberOfHospitalDays = parseInt(document.getElementById('numberOfHospitalDays').value);
        const widsDrugs = document.getElementById('widsDrugs').value;

        let risk = 0;

        if (age > 45) 
            risk += 20;

        if (glucose > 126) 
            risk += 30;

        if (bmi > 30) 
            risk += 25;

        if (systolicPressure > 140) 
            risk += 20;

        if (diastolicPressure > 90) 
            risk += 20;

        if (insulin > 20) 
            risk += 15;

        if (widsDrugs && widsDrugs.length > 0) 
            risk += 10;
        
        // Risk classification
        let riskLevel, riskClass, riskDescription;
        if (risk < 30) {
            riskLevel = "Thấp";
            riskClass = "text-green-600 dark:text-green-400";
            riskDescription = "Dựa trên thông tin bạn cung cấp, nguy cơ mắc bệnh tiểu đường của bạn ở mức thấp. Tuy nhiên, bạn nên duy trì lối sống lành mạnh và kiểm tra sức khỏe định kỳ.";
        } else if (risk < 60) {
            riskLevel = "Trung bình";
            riskClass = "text-yellow-600 dark:text-yellow-400";
            riskDescription = "Bạn có nguy cơ mắc bệnh tiểu đường ở mức trung bình. Nên kiểm tra đường huyết định kỳ và tham khảo ý kiến bác sĩ về việc điều chỉnh chế độ ăn uống và tập luyện.";
        } else {
            riskLevel = "Cao";
            riskClass = "text-red-600 dark:text-red-400";
            riskDescription = "Bạn có nguy cơ cao mắc bệnh tiểu đường. Khuyến nghị bạn nên gặp bác sĩ sớm để kiểm tra chi tiết và nhận tư vấn y tế chuyên sâu.";
        }
        
        // Display result
        displayResult({ risk, riskLevel, riskClass, riskDescription });
    }
    
    function displayResult(data) {
        resultContent.innerHTML = `
            <div class="mb-6 text-center">
                <div class="inline-block rounded-full bg-gray-100 dark:bg-gray-700 p-3 mb-3">
                    <svg class="h-8 w-8 ${data.riskClass}" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h4 class="text-lg font-semibold mb-1">Nguy cơ tiểu đường: <span class="${data.riskClass}">${data.riskLevel}</span></h4>
                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-3">
                    <div class="h-2.5 rounded-full ${data.riskClass}" style="width: ${data.risk}%"></div>
                </div>
            </div>
            <p class="text-gray-700 dark:text-gray-300 mb-4">${data.riskDescription}</p>
            <div class="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                <h4 class="font-medium text-primary dark:text-blue-400 mb-2">Khuyến nghị:</h4>
                <ul class="list-disc pl-5 text-gray-700 dark:text-gray-300 space-y-1 text-sm">
                    <li>Duy trì chế độ ăn uống cân bằng, hạn chế đường và carbohydrate tinh chế</li>
                    <li>Tập thể dục ít nhất 150 phút mỗi tuần</li>
                    <li>Kiểm tra đường huyết định kỳ</li>
                    <li>Duy trì cân nặng hợp lý</li>
                </ul>
            </div>
        `;
    }
});