import { ApartmentSharingLink } from 'df-shared-next/src/models/ApartmentSharingLink';
import type { SkipLink } from 'df-shared-next/src/models/SkipLink';
import { DfMessage } from 'df-shared-next/src/models/DfMessage';
import { FinancialDocument } from 'df-shared-next/src/models/FinancialDocument';

import { User } from 'df-shared-next/src/models/User';
import { Guarantor } from 'df-shared-next/src/models/Guarantor';
import { defineStore } from 'pinia';
import type { DfDocument } from 'df-shared-next/src/models/DfDocument';
import keycloak from '../plugin/keycloak';
import { DocumentTypeConstants } from '@/components/documents/share/DocumentTypeConstants';
import { DocumentType } from "df-shared-next/src/models/Document";

const MAIN_URL = `//${import.meta.env.VITE_MAIN_URL}`;
const FC_LOGOUT_URL = import.meta.env.VITE_FC_LOGOUT_URL || "";

interface State {
  user: User;
  selectedGuarantor: Guarantor;
  status: { loggedIn: false };
  isFunnel: boolean;
  spouseAuthorize: boolean;
  coTenantAuthorize: boolean;
  coTenants: User[];
  financialDocumentSelected: FinancialDocument;
  editFinancialDocument: false;
  newMessage: number;
  messageList: DfMessage[][];
  skipLinks: SkipLink[];
  guarantorFinancialDocumentSelected: FinancialDocument;
  editGuarantorFinancialDocument: boolean;
  apartmentSharingLinks: ApartmentSharingLink[];
}

function defaultState(): State {
  const tenantState: State = {
  user : new User(),
  selectedGuarantor : new Guarantor(),
  status : { loggedIn: false },
  isFunnel : false,
  spouseAuthorize : false,
  coTenantAuthorize : false,
  coTenants : [],
  financialDocumentSelected : new FinancialDocument(),
  editFinancialDocument: false,
  newMessage : 0,
  messageList : [],
  skipLinks : [],
  guarantorFinancialDocumentSelected : new FinancialDocument(),
  editGuarantorFinancialDocument : false,
  apartmentSharingLinks : []
  };
  return tenantState;
}

const initialStore = defaultState();

const useTenantStore = defineStore('tenant', {
  state: (): State => ({ ...initialStore }),
  getters: {
    getTenantDocuments(state): DfDocument[] {
      return state.user.documents || [];
    },
    getTenantIdentificationDocument(state): DfDocument | undefined {
      return state.user.documents?.find((d: DfDocument) => {
        return d.documentCategory === "IDENTIFICATION";
      });
    },
    getTenantResidencyDocument(state): DfDocument | undefined {
      return state.user.documents?.find((d: DfDocument) => {
        return d.documentCategory === "RESIDENCY";
      });
    },
    getTenantProfessionalDocument(state): DfDocument | undefined {
      return state.user.documents?.find((d: DfDocument) => {
        return d.documentCategory === "PROFESSIONAL";
      });
    },
    getTenantTaxDocument(state): DfDocument | undefined {
      return state.user.documents?.find((d: DfDocument) => {
        return d.documentCategory === "TAX";
      });
    },
    getGuarantorIdentificationLegalPersonDocument(
      state
    ): DfDocument | undefined {
      return state.selectedGuarantor?.documents?.find((d: DfDocument) => {
        return d.documentCategory === "IDENTIFICATION_LEGAL_PERSON";
      });
    },
    getGuarantorIdentificationDocument(state): DfDocument | undefined {
      return state.selectedGuarantor?.documents?.find((d: DfDocument) => {
        return d.documentCategory === "IDENTIFICATION";
      });
    },
    getGuarantorResidencyDocument(state): DfDocument | undefined {
      return state.selectedGuarantor?.documents?.find((d: DfDocument) => {
        return d.documentCategory === "RESIDENCY";
      });
    },
    getGuarantorProfessionalDocument(state): DfDocument | undefined {
      return state.selectedGuarantor?.documents?.find((d: DfDocument) => {
        return d.documentCategory === "PROFESSIONAL";
      });
    },
    getGuarantorTaxDocument(state): DfDocument | undefined {
      return state.selectedGuarantor?.documents?.find((d: DfDocument) => {
        return d.documentCategory === "TAX";
      });
    },

    getGuarantorDocuments(state): DfDocument[] {
      return state.selectedGuarantor.documents || [];
    },
    guarantor(state): Guarantor {
      return state.selectedGuarantor;
    },
    isLoggedIn: () => keycloak.authenticated,
    userToEdit(state): User | null {
      return state.user;
    },
    isFranceConnected(state): boolean {
      return state.user.franceConnect || false;
    },
    getRoommates(state): User[] {
      if (state.user.apartmentSharing === undefined) {
        return [];
      }
      return state.user.apartmentSharing.tenants
        .filter((r: User) => {
          return r.email !== state.user.email;
        })
        .map((u: User) => ({ ...u }));
    },
    newMessage(state): number {
      return state.newMessage;
    },
    spouseAuthorize(state): boolean {
      return state.spouseAuthorize;
    },
    coTenantAuthorize(state): boolean {
      return state.coTenantAuthorize;
    },
    guarantors(state): Guarantor[] {
      return state.user.guarantors;
    },
    getMessages(state): DfMessage[][] {
      return state.messageList;
    },
    tenantFinancialDocuments(state): FinancialDocument[] {
      const financialDocuments: FinancialDocument[] = [];
      if (state.user.documents !== null) {
        const docs = state.user.documents?.filter((d: DfDocument) => {
          return d.documentCategory === "FINANCIAL";
        });
        if (docs !== undefined && docs.length > 0) {
          docs
            .sort((a: DfDocument, b: DfDocument) => {
              return (a?.id || 0) - (b?.id || 0);
            })
            .forEach((d: DfDocument) => {
              const f = new FinancialDocument();
              f.noDocument = d.noDocument || false;
              f.customText = d.customText || "";
              if (f.customText === "-") {
                f.customText = "";
              }
              f.monthlySum = d.monthlySum || 0;
              f.id = d.id;

              const localDoc = DocumentTypeConstants.FINANCIAL_DOCS.find(
                (d2: DocumentType) => {
                  return d2.value === d.subCategory;
                }
              );
              if (localDoc !== undefined) {
                f.documentType = localDoc;
              }
              financialDocuments.push(f);
            });
        }
      }
      return financialDocuments;
    },
    guarantorFinancialDocuments(state): FinancialDocument[] {
      const financialdocuments: FinancialDocument[] = [];
      const g: Guarantor = state.selectedGuarantor;
      const dfDocs: DfDocument[] = g.documents || [];
      if (dfDocs !== null) {
        const docs = dfDocs?.filter((d: DfDocument) => {
          return d.documentCategory === "FINANCIAL";
        });
        if (docs !== undefined && docs.length > 0) {
          docs
            .sort((a: DfDocument, b: DfDocument) => {
              return (a?.id || 0) - (b?.id || 0);
            })
            .forEach((d: DfDocument) => {
              const f = new FinancialDocument();
              f.noDocument = d.noDocument || false;
              f.customText = d.customText || "";
              f.monthlySum = d.monthlySum || 0;
              f.id = d.id;

              const localDoc =
                DocumentTypeConstants.GUARANTOR_FINANCIAL_DOCS.find(
                  (d2: DocumentType) => {
                    return d2.value === d.subCategory;
                  }
                );
              if (localDoc !== undefined) {
                f.documentType = localDoc;
              }
              financialdocuments.push(f);
            });
        }
      }
      return financialdocuments;
    },
    financialDocumentSelected(state): FinancialDocument {
      return state.financialDocumentSelected;
    },
    editFinancialDocument(state): boolean {
      return state.editFinancialDocument;
    },
    guarantorFinancialDocumentSelected(state): FinancialDocument {
      return state.guarantorFinancialDocumentSelected;
    },
    editGuarantorFinancialDocument(state): boolean {
      return state.editGuarantorFinancialDocument;
    },
    coTenants(state): User[] {
      return state.coTenants;
    },
  },
  actions: {
  },
});

export default useTenantStore;
