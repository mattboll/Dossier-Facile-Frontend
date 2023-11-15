import { AuthService } from 'df-shared-next/src/services/AuthService';
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
import { AnalyticsService } from '@/services/AnalyticsService';
import { UtilsService } from '@/services/UtilsService';
import { ProfileService } from '@/services/ProfileService';

import * as Sentry from "@sentry/vue";
import moment from 'moment';
import { MessageService } from '@/services/MessageService';
import { ApartmentSharingLinkService } from '@/services/ApartmentSharingLinkService';
import { useRouter } from 'vue-router';
import { RegisterService } from '@/services/RegisterService';

const MAIN_URL = `//${import.meta.env.VITE_MAIN_URL}`;
const FC_LOGOUT_URL = import.meta.env.VITE_FC_LOGOUT_URL || "";

const router = useRouter();

interface State {
  user: User;
  selectedGuarantor: Guarantor;
  status: { loggedIn: boolean };
  isFunnel: boolean;
  spouseAuthorize: boolean;
  coTenantAuthorize: boolean;
  coTenants: User[];
  financialDocumentSelected: FinancialDocument;
  editFinancialDocument: boolean;
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
  status: { loggedIn: false },
  isFunnel: false,
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
    getUser: (state: State) => state.user,
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
    initState() {
      Object.assign(this, defaultState());
    },
    loginFailure() {
      this.status.loggedIn = false;
      this.user = new User();
      AnalyticsService.loginFail();
    },
    logout() {
      this.status.loggedIn = false;
      this.user = new User();
    },
    registerSuccess() {
      this.status.loggedIn = false;
      this.user = new User();
      AnalyticsService.registerSuccess();
    },
    registerFailure() {
      this.status.loggedIn = false;
      this.user = new User();
      AnalyticsService.registerFail();
    },
    unlinkFCSuccess() {
      this.user.franceConnect = false;
      AnalyticsService.unlinkFCSuccess();
    },
    loadUserCommit(user: User) {
      Object.assign(this.user, user);
      Object.assign(this.status.loggedIn, true);

      const applicationType = user?.apartmentSharing.applicationType;
      Object.assign(this.user, { applicationType: applicationType });

      if (applicationType === "COUPLE") {
        Object.assign(this.spouseAuthorize, true);
      }
      if (applicationType === "GROUP") {
        Object.assign(this.coTenantAuthorize, true);
      }
      // load CoTenants - basic information inside tenant
      if (applicationType === "COUPLE") {
        Object.assign(this.coTenants, this.user.apartmentSharing?.tenants.filter(
            (t: User) => t.id != this.user?.id
          ));
      }
      if (this.selectedGuarantor?.id) {
        let guarantor = user.guarantors.find((g: Guarantor) => {
          return g.id === this.selectedGuarantor.id;
        });

        if (!guarantor) {
          this.coTenants.forEach((t: User) => {
            const tmpGuarantor = t.guarantors?.find((g: Guarantor) => {
              return g.id === this.selectedGuarantor.id;
            });
            if (tmpGuarantor !== undefined) {
              guarantor = tmpGuarantor;
              return;
            }
          });
        }
        if (guarantor !== undefined) {
          Object.assign(this.selectedGuarantor, guarantor);
          return;
        }
      }
      Object.assign(this.selectedGuarantor, new Guarantor());
      Sentry.setContext("user", {
        id: user.id,
      });
    },
    setSelectedGuarantor(guarantor: Guarantor) {
      Object.assign(this.selectedGuarantor, guarantor);
    },
    createCoTenant(mail: string) {
      const u = new User();
      u.email = mail;
      u.firstName = "";
      u.lastName = "";
      this.user.apartmentSharing.tenants.push(u);
    },
    updateMessagesCommit(tenantId: number, messageList: any) {
      this.messageList[tenantId] = messageList;

      const unreadMessages = this.messageList
        .flat()
        .filter((message) => message.typeMessage === "TO_TENANT")
        .filter((message) => message.status === "UNREAD");
      this.newMessage = unreadMessages.length;
    },
    deleteRoommates(email: string) {
      const tenants = this.user.apartmentSharing.tenants.filter((t: User) => {
        return t.email !== email;
      });
      this.user.applicationType = "ALONE";
      this.user.apartmentSharing.tenants = tenants;
    },
    updateCoupleAuthorize(authorize: boolean) {
      this.spouseAuthorize = authorize;
    },
    updateCoTenantAuthorize(authorize: boolean) {
      this.coTenantAuthorize = authorize;
    },
    updateIsFunnel(isFunnel: boolean) {
      this.isFunnel = isFunnel;
    },
    updateSkipLinks(skipLinks: SkipLink[]) {
      this.skipLinks = skipLinks;
    },
    updateUserFirstname(firstname: string) {
      this.user.firstName = firstname;
    },
    updateUserLastname(lastname: string) {
      this.user.lastName = lastname;
    },
    updateUserPreferredname(preferredname: string) {
      this.user.preferredName = preferredname;
    },
    updateUserZipcode(zipcode: string) {
      this.user.zipCode = zipcode;
    },
    selectDocumentFinancial(d: FinancialDocument|undefined) {
      this.financialDocumentSelected = Object.assign({}, d);
      this.editFinancialDocument = d !== undefined;
    },
    createDocumentFinancial() {
      this.financialDocumentSelected = Object.assign(
        {},
        new FinancialDocument()
      );
      this.editFinancialDocument = true;
    },
    selectGuarantorDocumentFinancial(d: FinancialDocument) {
      Object.assign(this.guarantorFinancialDocumentSelected, d);
      Object.assign(this.editGuarantorFinancialDocument, d !== undefined);
    },
    createGuarantorDocumentFinancial() {
      Object.assign(this.guarantorFinancialDocumentSelected, new FinancialDocument());
      Object.assign(this.editGuarantorFinancialDocument, true);
    },
    setApartmentSharingLinks(links: ApartmentSharingLink[]) {
      const sortedLinks = links.sort(
        (a: ApartmentSharingLink, b: ApartmentSharingLink) =>
          (a.lastVisit || "") > (b.lastVisit || "") ? -1 : 1
      );
      Object.assign(this.apartmentSharingLinks, sortedLinks);
    },
    logout(redirect: boolean = true) {
      const isFC = this.user.franceConnect;
      return AuthService.logout()
        .then(async () => {
          await this.logout();
          await this.initState();
          if (isFC) {
            window.location.replace(FC_LOGOUT_URL);
            return;
          } else if (redirect) {
            window.location.replace(MAIN_URL);
            return;
          }
          location.reload();
        })
        .catch(async () => {
          console.log("Fail to logout - logout keycloak - force redirect");
          await keycloak.logout();
          await this.logout();
          await this.initState();
          window.location.replace(MAIN_URL);
        });
    },
    deleteAccount() {
      const isFC = this.user.franceConnect;
      return AuthService.deleteAccount().then(
        (response) => {
          this.logout();
          this.initState();
          if (isFC) {
            window.location.replace(
              "https://fcp.integ01.dev-franceconnect.fr/api/v1/logout"
            );
            return;
          } else {
            window.location.replace(MAIN_URL);
          }
          return Promise.resolve(response);
        },
        (error) => {
          return Promise.reject(error);
        }
      );
    },
    register(user: User, source: string, internalPartnerId: string) {
      return AuthService.register(user, source, internalPartnerId).then(
        (response) => {
          this.registerSuccess();
          return Promise.resolve(response.data);
        },
        (error) => {
          this.registerFailure();
          return Promise.reject(error);
        }
      );
    },
    resetPassword(user: User) {
      return AuthService.resetPassword(user).then(
        (user) => {
          return Promise.resolve(user);
        },
        (error) => {
          return Promise.reject(error);
        }
      );
    },
    unlinkFranceConnect(user: User) {
      if (!user.franceConnect) {
        return Promise.reject("Account is not a FranceConnect Account");
      }
      return ProfileService.unlinkFranceConnect().then(
        () => {
          // Force reload because some backend's GET endpoints retrieve and save user data by using JWT's information.
          keycloak.updateToken(-1).catch((err: any) => {
            console.error("Unlink FC Error" + err);
          });
          return this.unlinkFCSuccess();
        },
        (error) => {
          return Promise.reject(error);
        }
      );
    },
    loadUser() {
      return AuthService.loadUser().then(
        (response) => {
          this.loadUserCommit(response.data);
          return Promise.resolve(response.data);
        },
        (error) => {
          return Promise.reject(error);
        }
      );
    },
    loadCoTenant(coTenant: User) {
      return ProfileService.getCoTenant(coTenant.id).then(
        (response) => {
          return Promise.resolve(response.data);
        },
        (error) => {
          return Promise.reject(error);
        }
      );
    },
    setNames(user: User) {
      if (user.firstName && !user.franceConnect) {
        user.firstName = UtilsService.capitalize(user.firstName);
      }
      if (user.lastName && !user.franceConnect) {
        user.lastName = UtilsService.capitalize(user.lastName);
      }
      if (user.preferredName && !user.franceConnect) {
        user.preferredName = UtilsService.capitalize(user.preferredName);
      }
      return ProfileService.saveNames(user).then(
        (response) => {
          return this.loadUserCommit(response.data);
        },
        (error) => {
          return Promise.reject(error);
        }
      );
    },
    setRoommates(data: any) {
      return ProfileService.saveRoommates(data).then(
        (response) => {
          return this.loadUserCommit(response.data);
        },
        (error) => {
          return Promise.reject(error);
        }
      );
    },
    setCoTenants(data: any) {
      return ProfileService.saveCoTenants(data).then(
        (response) => {
          return this.loadUserCommit(response.data);
        },
        (error) => {
          return Promise.reject(error);
        }
      );
    },
    setLang(lang: any) {
      // TODO
      // i18n.locale = lang;
      // i18n.fallbackLocale = "fr";
      // moment.locale(lang);
      // const html = document.documentElement;
      // html.setAttribute("lang", i18n.locale);
      // const aYearFromNow = new Date();
      // aYearFromNow.setFullYear(aYearFromNow.getFullYear() + 1);
      // Vue.$cookies.set(
      //   "lang",
      //   lang,
      //   aYearFromNow,
      //   "",
      //   MAIN_URL.endsWith("dossierfacile.fr") ? "dossierfacile.fr" : "localhost"
      // );
    },
    validateFile(
      data: { honorDeclaration: boolean; clarification: string }
    ) {
      return ProfileService.validateFile(
        data.honorDeclaration,
        data.clarification
      ).then(
        () => {
          AnalyticsService.validateFile();
          this.loadUser().then(() => {
            router.push("/account");
          });
        },
        (error) => {
          return Promise.reject(error);
        }
      );
    },
    addNaturalGuarantor() {
      return ProfileService.setGuarantorType({
        typeGuarantor: "NATURAL_PERSON",
      }).then(
        (response) => {
          this.loadUserCommit(response.data);
          if (this.user.guarantors === undefined) {
            return Promise.reject();
          }
          this.setGuarantorPage(
              this.user.guarantors[this.user.guarantors.length - 1],
            0
          );
          return Promise.resolve(response.data);
        },
        (error) => {
          return Promise.reject(error);
        }
      );
    },
    async deleteAllGuarantors() {
      if (this.user.guarantors === undefined) {
        return Promise.resolve();
      }
      const promises = this.user.guarantors.map(async (g: Guarantor) => {
        await ProfileService.deleteGuarantor(g);
      });
      return Promise.all(promises).then(
        () => {
          return this.loadUser();
        },
        (error) => {
          return Promise.reject(error);
        }
      );
    },
    deleteGuarantor(g: Guarantor) {
      return ProfileService.deleteGuarantor(g).then(
        async (response) => {
          await this.loadUser();
          return Promise.resolve(response.data);
        },
        (error) => {
          return Promise.reject(error);
        }
      );
    },
    setGuarantorType(guarantorType: Guarantor) {
      return ProfileService.setGuarantorType(guarantorType).then(
        async (response) => {
          this.loadUserCommit(response.data);
          return Promise.resolve(response.data);
        },
        (error) => {
          return Promise.reject(error);
        }
      );
    },
    changePassword(user: User) {
      return AuthService.changePassword(user).then(
        (response) => {
          this.loadUserCommit(response.data);
          return Promise.resolve(user);
        },
        (error) => {
          return Promise.reject(error);
        }
      );
    },
    createPasswordCouple(user: User) {
      return AuthService.createPasswordCouple(user).then(
        (response) => {
          this.loadUserCommit(response.data);
          return Promise.resolve(user);
        },
        (error) => {
          return Promise.reject(error);
        }
      );
    },
    createPasswordGroup(user: User) {
      return AuthService.createPasswordGroup(user).then(
        (response) => {
          this.loadUserCommit(response.data);
          return Promise.resolve(user);
        },
        (error) => {
          return Promise.reject(error);
        }
      );
    },
    deleteDocument(docId: number) {
      return ProfileService.deleteDocument(docId).then(
        () => {
          return this.loadUser();
        },
        (error) => {
          return Promise.reject(error);
        }
      );
    },
    updateMessages() {
      if (keycloak.authenticated) {
        MessageService.updateMessages().then((data) => {
          this.updateMessagesCommit(
            this.user.id,
            data?.data || {}
          );
        });
        const spouse = UtilsService.getSpouse();
        if (spouse) {
          MessageService.updateMessages(spouse.id).then((data) => {
            this.updateMessagesCommit(spouse.id,
              data?.data || {},
            );
          });
        }
      }
    },
    sendMessage( message: string, tenantId: number) {
      return MessageService.postMessage({
        tenantId: tenantId,
        messageBody: message,
      }).then(() => {
        this.updateMessages();
      });
    },
    deleteCoTenant(tenant: User) {
      if (tenant.id && tenant.id > 0) {
        ProfileService.deleteCoTenant(tenant.id);
      }
      this.deleteRoommates(tenant.email);
    },
    async setTenantPage(substep: string) {
      router.push({
        name: "TenantDocuments",
        params: { substep },
      });
    },
    async setGuarantorPage(guarantor: Guarantor, substep: number, tenantId: number | undefined = undefined ) {
      await this.setSelectedGuarantor(guarantor);
      if (tenantId && tenantId != this.user.id) {
        router.push({
          name: "TenantGuarantorDocuments",
          params: {
            step: "5",
            substep: substep,
            tenantId: tenantId,
            guarantorId: guarantor.id,
          },
        });
      } else {
        router.push({
          name: "GuarantorDocuments",
          params: { substep },
        });
      }
    },
    saveTenantIdentification(formData: any) {
      return RegisterService.saveTenantIdentification(formData).then(
        (response) => {
          this.loadUserCommit(response.data);
          return Promise.resolve(response.data);
        },
        (error) => {
          return Promise.reject(error);
        }
      );
    },
    saveCoTenantIdentification(formData: any) {
      return RegisterService.saveCoTenantIdentification(formData).then(
        (response) => {
          this.loadUserCommit(response.data);
          return Promise.resolve(response.data);
        },
        (error) => {
          return Promise.reject(error);
        }
      );
    },
    saveGuarantorName(formData: any) {
      return RegisterService.saveGuarantorName(formData).then(
        (response) => {
          this.loadUserCommit(response.data);
          return Promise.resolve(response.data);
        },
        (error) => {
          return Promise.reject(error);
        }
      );
    },
    saveGuarantorIdentification(formData: any) {
      return RegisterService.saveGuarantorIdentification(formData).then(
        (response) => {
          this.loadUserCommit(response.data);
          return Promise.resolve(response.data);
        },
        (error) => {
          return Promise.reject(error);
        }
      );
    },
    saveTenantResidency(formData: any) {
      return RegisterService.saveTenantResidency(formData).then(
        (response) => {
          this.loadUserCommit(response.data);
          return Promise.resolve(response.data);
        },
        (error) => {
          return Promise.reject(error);
        }
      );
    },
    saveGuarantorResidency(formData: any) {
      return RegisterService.saveGuarantorResidency(formData).then(
        (response) => {
          this.loadUserCommit(response.data);
          return Promise.resolve(response.data);
        },
        (error) => {
          return Promise.reject(error);
        }
      );
    },
    saveTenantProfessional(formData: any) {
      return RegisterService.saveTenantProfessional(formData).then(
        (response) => {
          this.loadUserCommit(response.data);
          return Promise.resolve(response.data);
        },
        (error) => {
          return Promise.reject(error);
        }
      );
    },
    saveGuarantorProfessional(formData: any) {
      return RegisterService.saveGuarantorProfessional(formData).then(
        (response) => {
          this.loadUserCommit(response.data);
          return Promise.resolve(response.data);
        },
        (error) => {
          return Promise.reject(error);
        }
      );
    },
    saveTenantFinancial(formData: any) {
      return RegisterService.saveTenantFinancial(formData).then(
        async (response) => {
          await this.loadUserCommit(response.data);
          const fd = await this.state.getters.tenantFinancialDocuments();
          if (fd === undefined) {
            return Promise.resolve(response.data);
          }
          if (formData.has("id")) {
            const s = fd.find((f: any) => {
              return f.id.toString() === formData.get("id");
            });
            if (s !== undefined) {
              await this.selectDocumentFinancial(s);
            } else {
              await this.selectDocumentFinancial(fd[fd.length - 1]);
            }
          } else {
            await this.selectDocumentFinancial(fd[fd.length - 1]);
          }
          return Promise.resolve(response.data);
        },
        (error) => {
          return Promise.reject(error);
        }
      );
    },
    saveGuarantorFinancial(, formData) {
      return RegisterService.saveGuarantorFinancial(formData)
        .then(async (response) => {
          await commit("loadUserCommit", response.data);
          const fd = this.getters.guarantorFinancialDocuments;
          if (fd === undefined) {
            return Promise.resolve(response.data);
          }
          if (formData.has("id")) {
            const s = fd.find((f: any) => {
              return f.id.toString() === formData.get("id");
            });
            await commit("selectGuarantorDocumentFinancial", s);
          } else {
            await commit("selectGuarantorDocumentFinancial", fd[fd.length - 1]);
          }
          return Promise.resolve(response.data);
        })
        .catch((error) => {
          return Promise.reject(error);
        });
    },
    saveTenantTax(, formData) {
      return RegisterService.saveTenantTax(formData).then(
        (response) => {
          commit("loadUserCommit", response.data);
          return Promise.resolve(response.data);
        },
        (error) => {
          return Promise.reject(error);
        }
      );
    },
    saveGuarantorTax(, formData) {
      return RegisterService.saveGuarantorTax(formData).then(
        (response) => {
          commit("loadUserCommit", response.data);
          return Promise.resolve(response.data);
        },
        (error) => {
          return Promise.reject(error);
        }
      );
    },
    firstProfilePage() {
      if (this.state.user.documents === undefined) {
        return;
      }
      if (
        !this.state.user.firstName ||
        !this.state.user.lastName ||
        (!this.state.user.zipCode && this.state.user.documents.length == 0)
      ) {
        router.push({ name: "TenantName" });
        return;
      }
      if (!this.state.user.applicationType) {
        router.push({ name: "TenantType" });
        return;
      }
      if (!UtilsService.hasDoc("IDENTIFICATION")) {
        router.push({ name: "TenantDocuments", params: { substep: "1" } });
        return;
      }
      if (!UtilsService.isTenantDocumentValid("RESIDENCY")) {
        router.push({ name: "TenantDocuments", params: { substep: "2" } });
        return;
      }
      if (!UtilsService.hasDoc("PROFESSIONAL")) {
        router.push({ name: "TenantDocuments", params: { substep: "3" } });
        return;
      }
      if (!UtilsService.isTenantDocumentValid("FINANCIAL")) {
        router.push({ name: "TenantDocuments", params: { substep: "4" } });
        return;
      }
      if (!UtilsService.isTenantDocumentValid("TAX")) {
        router.push({ name: "TenantDocuments", params: { substep: "5" } });
        return;
      }
      if (this.state.user.guarantors) {
        for (const g of this.state.user.guarantors) {
          if (!UtilsService.guarantorHasDoc("IDENTIFICATION", g)) {
            this.dispatch("setGuarantorPage", { guarantor: g, substep: 1 });
            return;
          }
          if (!UtilsService.isGuarantorDocumentValid("RESIDENCY", g)) {
            this.dispatch("setGuarantorPage", { guarantor: g, substep: 2 });
            return;
          }
          if (!UtilsService.guarantorHasDoc("PROFESSIONAL", g)) {
            this.dispatch("setGuarantorPage", { guarantor: g, substep: 3 });
            return;
          }
          if (!UtilsService.isGuarantorDocumentValid("FINANCIAL", g)) {
            this.dispatch("setGuarantorPage", { guarantor: g, substep: 4 });
            return;
          }
          if (!UtilsService.isGuarantorDocumentValid("TAX", g)) {
            this.dispatch("setGuarantorPage", { guarantor: g, substep: 5 });
            return;
          }
        }
      }

      if (!this.state.user.honorDeclaration) {
        router.push({ name: "ValidateFile" });
        return;
      }

      router.push({ name: "TenantName" });
    },
    updateSelectedGuarantor(, tenantId: number) {
      let guarantors;
      if (this.state.user.id === tenantId) {
        guarantors = this.state.user.guarantors;
      } else {
        const coTenant = this.state.coTenants.find((r: User) => {
          return r.id === tenantId;
        });
        guarantors = coTenant?.guarantors;
      }

      if (guarantors && guarantors.length > 0) {
        this.setSelectedGuarantor(guarantors[guarantors.length - 1]);
        return;
      }
      this.setSelectedGuarantor(new Guarantor());
    },
    readMessages(tenantId?: number) {
      return MessageService.markMessagesAsRead(tenantId).then(
        (response) => {
          this.updateMessagesCommit({ tenantId, messageList: response.data });
          return Promise.resolve(response.data);
        },
        (error) => {
          return Promise.reject(error);
        }
      );
    },
    loadApartmentSharingLinks() {
      return ApartmentSharingLinkService.getLinks().then(
        (response) => {
          const links = response.data.links || [];
          this.setApartmentSharingLinks(links);
          return Promise.resolve(links);
        },
        (error) => {
          return Promise.reject(error);
        }
      );
    },
    deleteApartmentSharingLink(linkToDelete: ApartmentSharingLink) {
      ApartmentSharingLinkService.deleteLink(linkToDelete).then((_) => {
        const newLinks = this.apartmentSharingLinks.filter(
          (link) => link.id !== linkToDelete.id
        );
        this.setApartmentSharingLinks(newLinks);
      });
    },
    async updateApartmentSharingLinkStatus(
      { link: linkToUpdate, enabled }
    ) {
      await ApartmentSharingLinkService.updateLinkStatus(linkToUpdate, enabled);
      const updatedLinks = this.apartmentSharingLinks.map((link) => {
        if (link.id === linkToUpdate.id) {
          link.enabled = enabled;
        }
        return link;
      });
      this.setApartmentSharingLinks(updatedLinks);
    },
  },
});

export default useTenantStore;
