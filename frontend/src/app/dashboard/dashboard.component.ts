import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { ActivatedRoute } from '@angular/router';
import { ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  username = '';
  searchTerm = '';
  airlines: string[] = [];
  selectedAirline = '';
  aircraft: any[] = [];
  seen: string[] = [];
  groupedAircraft: { [type: string]: any[] } = {};
  filteredGroupedAircraft: { [type: string]: any[] } = {};

  pieChartData: ChartConfiguration['data'] = {
    datasets: [{
      data: [0, 0],
      label: 'Aircraft',
      backgroundColor: ['#FF6384', '#36A2EB'],
      hoverBackgroundColor: ['#FF6384', '#36A2EB']
    }],
    labels: ['Seen', 'Not Seen']
  };

  pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top'
      }
    }
  };

  constructor(private api: ApiService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.username = this.route.snapshot.queryParams['username'] || 'testUser';
    console.log('Username:', this.username);
    // Load airlines from API
    this.api.getAirlines().subscribe(airlines => {
      console.log('Airlines:', airlines);
      if (airlines.length === 0) {
        console.error('No airlines found.');
        return;
      }
      this.airlines = airlines;
      // Select the first airline by default.
      this.selectedAirline = airlines[0];
      this.loadAircraft();
    }, error => {
      console.error('Error fetching airlines:', error);
    });
  }

  loadAircraft() {
    if (!this.selectedAirline) {
      console.error('No airline selected.');
      return;
    }
    this.api.getAircraft(this.selectedAirline).subscribe(data => {
      console.log('Aircraft data:', data);
      // Expecting data as an array of objects with an "aircraft" property.
      this.aircraft = data.flatMap((group: any) => group.aircraft || []);
      console.log('Flattened aircraft:', this.aircraft);
      if (this.aircraft.length === 0) {
        console.error('No aircraft found for this airline.');
      }
      this.groupAircraft();
      this.loadSeen();
    }, error => {
      console.error('Error fetching aircraft:', error);
    });
  }

  groupAircraft(): void {
    // Group by aircraftType
    this.groupedAircraft = this.aircraft.reduce((groups, plane) => {
      const type = plane.aircraftType || 'Unknown';
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(plane);
      return groups;
    }, {} as { [type: string]: any[] });
    // Initially, show all groups.
    this.filteredGroupedAircraft = { ...this.groupedAircraft };
    console.log('Grouped aircraft:', this.groupedAircraft);
  }

  loadSeen() {
    this.api.getSeen(this.username, this.selectedAirline).subscribe(seen => {
      console.log('Seen aircraft:', seen);
      this.seen = seen || [];
      this.updatePieChart();
    }, error => {
      console.error('Error fetching seen aircraft:', error);
    });
  }

  toggleSeen(registration: string) {
    this.api.updateSeen(this.username, this.selectedAirline, registration).subscribe(() => {
      this.loadSeen();
    }, error => {
      console.error('Error updating seen aircraft:', error);
    });
  }

  updatePieChart() {
    const seenCount = this.seen.length;
    const total = this.aircraft.length;
    this.pieChartData.datasets[0].data = [seenCount, total - seenCount];
    console.log('Updated pie chart data:', this.pieChartData);
    // Force chart update.
    this.pieChartData = { ...this.pieChartData };
  }

  onAirlineChange() {
    this.loadAircraft();
  }

  filterAircraft() {
    if (!this.searchTerm) {
      this.filteredGroupedAircraft = { ...this.groupedAircraft };
      return;
    }
    const searchTermLower = this.searchTerm.toLowerCase();
    this.filteredGroupedAircraft = Object.keys(this.groupedAircraft).reduce((acc, type) => {
      const filteredPlanes = this.groupedAircraft[type].filter(plane =>
        plane.registration.toLowerCase().includes(searchTermLower)
      );
      if (filteredPlanes.length > 0) {
        acc[type] = filteredPlanes;
      }
      return acc;
    }, {} as { [type: string]: any[] });
    console.log('Filtered grouped aircraft:', this.filteredGroupedAircraft);
  }
}
