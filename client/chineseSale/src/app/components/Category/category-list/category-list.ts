import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../../services/Category/category-service';
import { CategoryModel } from '../../../models/Category/CategoryModel';
import { CategoryCreateModel } from '../../../models/Category/CategoryCreateModel';

interface CategoryTheme {
  gradient: string;
  light: string;
  text: string;
  shadow: string;
  icon: string;
}

const CATEGORY_THEMES: CategoryTheme[] = [
  {
    gradient: 'linear-gradient(135deg, #8b4513 0%, #a0522d 100%)',
    light: '#f8f3ee', text: '#6b3410', shadow: 'rgba(139, 69, 19, 0.30)',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`
  },
  {
    gradient: 'linear-gradient(135deg, #daa520 0%, #ffd700 100%)',
    light: '#fdf8eb', text: '#8a6b00', shadow: 'rgba(218, 165, 32, 0.30)',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`
  },
  {
    gradient: 'linear-gradient(135deg, #A31532 0%, #C41E3A 100%)',
    light: '#fdf0f2', text: '#7B1025', shadow: 'rgba(163, 21, 50, 0.30)',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>`
  },
  {
    gradient: 'linear-gradient(135deg, #cd853f 0%, #deb887 100%)',
    light: '#faf5ef', text: '#8b5e2b', shadow: 'rgba(205, 133, 63, 0.30)',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`
  },
  {
    gradient: 'linear-gradient(135deg, #b8912e 0%, #d4a843 100%)',
    light: '#fdf7ec', text: '#7a5f1a', shadow: 'rgba(184, 145, 46, 0.30)',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`
  },
  {
    gradient: 'linear-gradient(135deg, #6b2f0a 0%, #8b4513 100%)',
    light: '#f5ede5', text: '#4a1f06', shadow: 'rgba(107, 47, 10, 0.30)',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>`
  },
  {
    gradient: 'linear-gradient(135deg, #c62828 0%, #ef5350 100%)',
    light: '#fef2f2', text: '#8e1c1c', shadow: 'rgba(198, 40, 40, 0.30)',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z"/></svg>`
  },
  {
    gradient: 'linear-gradient(135deg, #d4a843 0%, #e8c56d 100%)',
    light: '#fef9ee', text: '#8a6b00', shadow: 'rgba(212, 168, 67, 0.30)',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`
  },
  {
    gradient: 'linear-gradient(135deg, #a0522d 0%, #cd853f 100%)',
    light: '#f9f2ea', text: '#6b3410', shadow: 'rgba(160, 82, 45, 0.30)',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>`
  },
  {
    gradient: 'linear-gradient(135deg, #7B1025 0%, #A31532 100%)',
    light: '#fbeef0', text: '#5a0c1c', shadow: 'rgba(123, 16, 37, 0.30)',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`
  },
];

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './category-list.html',
  styleUrls: ['./category-list.scss'],
})
export class CategoryList implements OnInit {
  categories: CategoryModel[] = [];
  filteredCategories: CategoryModel[] = [];
  showForm = false;
  editingCategory?: CategoryModel;
  newCategoryName = '';
  errorMsg = '';
  searchTerm = '';

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories() {
    this.categoryService.getAll().subscribe({
      next: (res) => {
        this.categories = res;
        this.applyFilter();
      },
      error: () => this.errorMsg = 'שגיאה בטעינת הקטגוריות'
    });
  }

  applyFilter() {
    const term = this.searchTerm.trim().toLowerCase();
    this.filteredCategories = term
      ? this.categories.filter(c => c.name.toLowerCase().includes(term))
      : [...this.categories];
  }

  getTheme(index: number): CategoryTheme {
    return CATEGORY_THEMES[index % CATEGORY_THEMES.length];
  }

  getCategoryIndex(cat: CategoryModel): number {
    return this.categories.indexOf(cat);
  }

  openAdd() {
    this.editingCategory = undefined;
    this.newCategoryName = '';
    this.showForm = true;
    this.errorMsg = '';
  }

  openEdit(cat: CategoryModel) {
    this.editingCategory = cat;
    this.newCategoryName = cat.name;
    this.showForm = true;
    this.errorMsg = '';
  }

  save() {
    if (!this.newCategoryName.trim()) return;
    const dto: CategoryCreateModel = { name: this.newCategoryName.trim() };
    this.errorMsg = '';

    if (this.editingCategory) {
      this.categoryService.update(this.editingCategory.id, dto).subscribe({
        next: () => { this.showForm = false; this.loadCategories(); },
        error: (err) => this.errorMsg = err.error?.message || 'שגיאה בעדכון'
      });
    } else {
      this.categoryService.add(dto).subscribe({
        next: () => { this.showForm = false; this.loadCategories(); },
        error: (err) => this.errorMsg = err.error?.message || 'שגיאה בהוספה'
      });
    }
  }

  cancelForm() {
    this.showForm = false;
    this.errorMsg = '';
  }

  deleteCategory(id: number) {
    if (confirm('האם אתה בטוח שברצונך למחוק את הקטגוריה?')) {
      this.categoryService.delete(id).subscribe({
        next: () => this.loadCategories(),
        error: (err) => alert(err.error?.message || 'שגיאה במחיקה')
      });
    }
  }
}
