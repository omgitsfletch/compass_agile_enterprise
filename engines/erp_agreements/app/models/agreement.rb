class Agreement < ActiveRecord::Base

	belongs_to	:agreement_type
	has_many 	:agreement_items
	has_many 	:agreement_party_roles
	has_many	:parties, :through => :agreement_party_roles
  
  def agreement_relationships
    AgreementRelationship.find(:all, :conditions => ['agreement_id_from = ? OR agreement_id_to = ?',id,id])
  end
  
  def to_s
      "#{description}"
  end
 
  def to_label
      to_s
  end

  def find_parties_by_role(role)
    self.parties.find(:all, :include => [:agreement_party_roles], :conditions => ["role_type_id = ?", role.id])
  end

  def get_item_by_item_type_internal_identifier(item_type_internal_identifier)
    agreement_items.each do |agreement_item|
      if (agreement_item.agreement_item_type.internal_identifier == item_type_internal_identifier)
        return agreement_item.agreement_item_value
      end
    end
    nil
  end

end