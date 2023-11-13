import { ApartmentSharingLink } from 'df-shared-next/src/models/ApartmentSharingLink';
import type { SkipLink } from 'df-shared-next/src/models/SkipLink';
import { DfMessage } from 'df-shared-next/src/models/DfMessage';
import { FinancialDocument } from 'df-shared-next/src/models/FinancialDocument';

import { User } from 'df-shared-next/src/models/User';
import { Guarantor } from 'df-shared-next/src/models/Guarantor';
import { defineStore } from 'pinia';

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
  },
  actions: {
  },
});

export default useTenantStore;
