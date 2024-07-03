import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';

interface Cable {
  name: string;
  code: string;
}
type Style = {
  color?: string;
};

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [FormsModule, MultiSelectModule, CommonModule],
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.css'],
})
export class DropdownComponent implements OnInit {
  resizingEvent = {
    isResizing: false,
    startingCursorX: 0,
    startingWidth: 0,
  };

  cables: Cable[] | undefined;

  selectedCables: Cable[] = [];

  ngOnInit() {
    this.cables = [
      { name: 'Fiber', code: 'F' },
      { name: 'Electrical', code: 'E' },
      { name: 'Drain pipe', code: 'DP' },
      { name: 'Tractor pipe', code: 'TP' },
    ];
  }
  public sideBarWidth = '150';

  isSelected(cable: Cable): boolean {
    return this.selectedCables.some(selected => selected.code === cable.code);
  }

  getSymbolStyle(cable: Cable): Style {
    switch (cable.code) {
      case 'F':
        return { color: 'blue' };
      case 'E':
        return { color: 'red' };
      case 'DP':
        return { color: 'green' };
      case 'TP':
        return { color: 'orange' };
      default:
        return {};
    }
  }
}
