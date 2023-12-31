(ns todo.core
  (:require
   [reagent.core :as r]
   [reagent.dom :as d]))

(def todos (r/atom [{:desc "Boil the pasta" :completed true} {:desc "Boil the pasta" :completed false}]))

;;components
(defn todo-item [todo]
  [:li  {:style {:color (if (:completed todo) "purple" "green")}} (:desc todo)])


(defn todo-form []
  (let [new-item (r/atom "") new-item-completed (r/atom false)]
    (fn []
      [:form {:on-submit (fn [e]
                           (.preventDefault e)
                           (swap! todos conj {:completed @new-item-completed :desc @new-item})
                           (reset! new-item "")
                           (reset! new-item-completed false))}
       [:input {:type "checkbox" :checked @new-item-completed
                :on-change #(reset! new-item-completed (-> % .-target .-checked))}]
       [:input {:type "text"
                :value @new-item
                :placeholder "Add a new item"
                :on-change (fn [e]
                             (reset! new-item (.-value (.-target e))))}]])))




;; -------------------------
;; Views
(defn home-page []
  [:div
   [:h2 "Lists keep it simple"]
   [:p "Add a new item below:"]
   [todo-form]
   [:ul
    (for [todo @todos]
      (todo-item todo))]])

;; -------------------------
;; Initialize app

(defn mount-root []
  (d/render [home-page] (.getElementById js/document "app")))

(defn ^:export init! []
  (mount-root))
