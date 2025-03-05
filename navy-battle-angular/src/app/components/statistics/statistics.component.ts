import { Component } from '@angular/core';
import { 
  Chart, 
  BarController, 
  PieController, 
  BarElement, 
  LineElement, 
  ArcElement,
  CategoryScale, 
  LinearScale, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

// Register the necessary Chart.js components
Chart.register(
  BarController,
  PieController,
  BarElement,
  LineElement,
  ArcElement, 
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './statistics.component.html'
})
export class StatisticsComponent {
  totalGames: number = 120;
  winRate: number = 65;
  accuracy: number = 78;

  chartData: any = {
    labels: ['Wins', 'Losses', 'Shots Fired', 'Hits'],
    datasets: [{
      data: [78, 42, 500, 390],
      backgroundColor: ['#34D399', '#EF4444', '#3B82F6', '#FBBF24'],
    }]
  };

  winLossChartData: any = {
    labels: ['Wins', 'Losses'],
    datasets: [{
      data: [78, 42],
      backgroundColor: ['#10B981', '#EF4444'],
    }]
  };

  chartOptions: any = {
    responsive: true,
    plugins: { 
      legend: { 
        display: false 
      } 
    }
  };

  recentMatches = [
    { date: '2024-03-01', result: 'Win', shots: 40, hits: 30 },
    { date: '2024-03-02', result: 'Loss', shots: 35, hits: 20 },
    { date: '2024-03-03', result: 'Win', shots: 50, hits: 40 },
    { date: '2024-03-04', result: 'Win', shots: 45, hits: 35 }
  ];
}