import { Component, OnInit } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { TreeTableModule } from 'primeng/treetable';
import { NodeService } from '../node.service';
import { CommonModule } from '@angular/common';

interface Column {
  field: string;
  header: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [TreeTableModule, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
  providers: [NodeService],
})
export class SidebarComponent implements OnInit {
  files!: TreeNode[];
  selectionKeys = {};

  cols!: Column[];

  constructor(private nodeService: NodeService) {}

  ngOnInit() {
    this.nodeService.getFilesystem().then(files => (this.files = files));
    this.cols = [
      { field: 'name', header: 'Name' },
      { field: 'size', header: 'Size' },
      { field: 'type', header: 'Type' },
    ];

    this.selectionKeys = {
      '0-0': {
        partialChecked: false,
        checked: true,
      },
    };
  }
}
