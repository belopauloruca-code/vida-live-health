
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator } from 'lucide-react';

interface BMICardProps {
  weight: string;
  height: string;
}

export const BMICard: React.FC<BMICardProps> = ({ weight, height }) => {
  const calculateBMI = () => {
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height) / 100;
    
    if (weightNum && heightNum) {
      const bmi = weightNum / (heightNum * heightNum);
      return bmi.toFixed(1);
    }
    return null;
  };

  const getBMIClassification = (bmi: number) => {
    if (bmi < 18.5) return { text: 'Abaixo do peso', color: 'text-blue-600' };
    if (bmi < 25) return { text: 'Peso normal', color: 'text-green-600' };
    if (bmi < 30) return { text: 'Sobrepeso', color: 'text-yellow-600' };
    if (bmi < 35) return { text: 'Obesidade grau I', color: 'text-orange-600' };
    if (bmi < 40) return { text: 'Obesidade grau II', color: 'text-red-600' };
    return { text: 'Obesidade grau III', color: 'text-red-700' };
  };

  const bmi = calculateBMI();
  const bmiData = bmi ? getBMIClassification(parseFloat(bmi)) : null;

  if (!bmi) return null;

  return (
    <Card className="mb-6 border-green-100">
      <CardHeader>
        <CardTitle className="flex items-center text-green-600">
          <Calculator className="h-5 w-5 mr-2" />
          Índice de Massa Corporal (IMC)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-gray-900">{bmi}</div>
            <div className={`text-sm font-medium ${bmiData?.color}`}>
              {bmiData?.text}
            </div>
          </div>
          <div className="text-right text-sm text-gray-600">
            <div>{weight} kg</div>
            <div>{height} cm</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
