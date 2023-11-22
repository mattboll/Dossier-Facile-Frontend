import { toast } from 'vue3-toastify';
import i18n from '@/i18n';


export const ToastService = {

	maxFileError(value: number, max: number) {
		toast.error(i18n.global.t("max-file", [value, max]));
	}
}